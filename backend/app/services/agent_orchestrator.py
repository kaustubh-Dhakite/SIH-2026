"""Agent orchestration service using LangGraph"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from ..config import settings
from .llm_service import llm_service
from .rag_service import rag_service


class AgentState:
    """Agent execution state"""
    def __init__(self):
        self.query: str = ""
        self.context: List[Dict[str, Any]] = []
        self.result: str = ""
        self.trace: List[Dict[str, Any]] = []
        self.kb_ids: List[str] = []
        self.tools: List[str] = []
        self.system_prompt: str = ""
        self.model: str = settings.OLLAMA_MODEL_MAIN


class AgentOrchestrator:
    """Orchestrates agent task execution"""
    
    def __init__(self):
        self.default_model = settings.OLLAMA_MODEL_MAIN
    
    async def execute_task(
        self,
        query: str,
        kb_ids: List[str],
        tools: List[str],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute agent task with workflow"""
        import json
        import re
        state = AgentState()
        state.query = query
        state.kb_ids = kb_ids
        state.tools = tools
        state.system_prompt = system_prompt or "You are a helpful AI assistant. Be concise."
        state.model = model or self.default_model
        
        start_time = datetime.utcnow()
        
        # Pre-fetch RAG context BEFORE entering the LLM loop (saves one full round-trip)
        rag_context = ""
        if "rag" in tools and kb_ids:
            await self._add_trace(state, "Retrieving knowledge", "running")
            try:
                results = await rag_service.search(query=query, kb_ids=kb_ids, top_k=4, score_threshold=0.5)
                state.context = results
                if results:
                    rag_context = "\n\nRelevant context from knowledge base:\n" + "\n".join(
                        [f"- {r['text'][:400]} (Source: {r['source']})" for r in results]
                    )
                await self._add_trace(state, "Retrieving knowledge", "completed", 0)
            except Exception as e:
                print(f"RAG prefetch error: {e}")
                await self._add_trace(state, "Retrieving knowledge", "failed", 0)
        
        # Compact tool descriptions
        tool_descriptions = ""
        non_rag_tools = [t for t in tools if t != "rag"]
        if non_rag_tools:
            tool_descriptions = "Tools available (respond with JSON to use): "
            if "code_sandbox" in non_rag_tools:
                tool_descriptions += '{"tool":"code_sandbox","tool_input":{"code":"..."}} '
            if "file_ops" in non_rag_tools:
                tool_descriptions += '{"tool":"file_ops","tool_input":{"action":"read","path":"..."}} '
            tool_descriptions += "\nFor final answer: {\"response\":\"...\"}\n"
        
        try:
            messages = f"{state.system_prompt}\n{tool_descriptions}{rag_context}\n\nUser: {query}\nAssistant:"
            
            for iteration in range(2): # Max 2 steps - most queries resolve in 1
                step_start = datetime.utcnow()
                await self._add_trace(state, f"Thinking (Step {iteration+1})", "running")
                
                llm_response = await llm_service.generate(
                    model=state.model,
                    prompt=messages,
                    temperature=0.1
                )
                
                await self._add_trace(state, f"Thinking (Step {iteration+1})", "completed", (datetime.utcnow() - step_start).total_seconds())
                
                # Parse JSON
                try:
                    # Find JSON block
                    json_match = re.search(r'\{.*\}', llm_response.replace('\n', ' '))
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                    else:
                        parsed = {"response": llm_response}
                except:
                    parsed = {"response": llm_response}
                
                if "response" in parsed:
                    state.result = parsed["response"]
                    break
                elif "tool" in parsed:
                    tool_name = parsed["tool"]
                    tool_input = parsed.get("tool_input", {})
                    
                    tool_start = datetime.utcnow()
                    await self._add_trace(state, f"Tool Execution: {tool_name}", "running")
                    
                    tool_result = ""
                    if tool_name == "rag" and "rag" in tools:
                        q = tool_input.get("query", query)
                        results = await rag_service.search(query=q, kb_ids=state.kb_ids, top_k=5, score_threshold=0.6)
                        state.context.extend(results)
                        if results:
                            tool_result = "Found relevant knowledge: \n" + "\n".join([f"- {r['text']} (Source: {r['source']})" for r in results])
                        else:
                            tool_result = "No relevant knowledge found."
                    elif tool_name == "code_sandbox" and "code_sandbox" in tools:
                        tool_result = "Sandbox execution simulated: code ran successfully." # Simplified for safety
                    elif tool_name == "file_ops" and "file_ops" in tools:
                        tool_result = f"File {tool_input.get('action')} simulated on {tool_input.get('path')}."
                    else:
                        tool_result = f"Error: Tool {tool_name} not available or not permitted."
                        
                    await self._add_trace(state, f"Tool Execution: {tool_name}", "completed", (datetime.utcnow() - tool_start).total_seconds(), {"result": tool_result})
                    
                    json_hint = '{"response": "..."}'
                    messages += f"\n\nTool '{tool_name}' returned:\n{tool_result}\n\nNow, provide the final answer using {json_hint} or call another tool."
                else:
                    state.result = llm_response
                    break
            
            if not state.result:
                state.result = "Failed to generate a final response within the step limit."
                
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "completed",
                "result": state.result,
                "trace": state.trace,
                "context": state.context,
                "duration": duration
            }
        
        except Exception as e:
            print(f"Task execution error: {e}")
            await self._add_trace(state, "Task execution", "failed", 0, {"error": str(e)})
            return {
                "status": "failed",
                "result": f"Error: {str(e)}",
                "trace": state.trace,
                "context": [],
                "duration": (datetime.utcnow() - start_time).total_seconds()
            }
    
    async def _retrieve_knowledge(self, state: AgentState):
        """Retrieve relevant knowledge"""
        results = await rag_service.search(
            query=state.query,
            kb_ids=state.kb_ids,
            top_k=5,
            score_threshold=0.7
        )
        state.context = results
    
    async def _generate_response(self, state: AgentState):
        """Generate LLM response"""
        # Build prompt with context
        prompt = f"Query: {state.query}\n\n"
        
        if state.context:
            prompt += "Relevant Context:\n"
            for i, ctx in enumerate(state.context, 1):
                prompt += f"\n{i}. {ctx['text'][:500]}...\n(Source: {ctx['source']}, Score: {ctx['score']:.2f})\n"
            prompt += "\n"
        
        prompt += "\nPlease provide a comprehensive response based on the query and context above."
        
        # Generate response
        response = await llm_service.generate(
            model=state.model,
            prompt=prompt,
            system=state.system_prompt,
            temperature=0.7
        )
        
        state.result = response
    
    async def _add_trace(
        self,
        state: AgentState,
        action: str,
        status: str,
        duration: float = 0,
        details: Optional[Dict[str, Any]] = None
    ):
        """Add trace step"""
        step = len([t for t in state.trace if t.get("action") == action and t.get("status") != "running"]) + 1
        
        trace_entry = {
            "step": step,
            "action": action,
            "status": status,
            "duration": duration,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if details:
            trace_entry["details"] = details
        
        # Update or append trace
        existing_idx = None
        for i, t in enumerate(state.trace):
            if t["action"] == action and t["status"] == "running":
                existing_idx = i
                break
        
        if existing_idx is not None:
            state.trace[existing_idx] = trace_entry
        else:
            state.trace.append(trace_entry)


# Singleton instance
agent_orchestrator = AgentOrchestrator()

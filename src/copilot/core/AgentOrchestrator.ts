import { WorkContext } from '../types';
import { SkillRegistry, SkillResult } from './SkillRegistry';
import { PersonaEngine } from './PersonaEngine';

export class AgentOrchestrator {
  static async process(
    input: string, 
    context: WorkContext, 
    dispatch: any,
    globalState?: any
  ): Promise<SkillResult> {
    // 1. Find matching skill (Intent Router)
    const skill = SkillRegistry.find(s => s.trigger(input, context));

    if (skill) {
      console.log(`Detected Intent: ${skill.name}`);
      // 2. Execute skill with global state for memory access (Intent Handler)
      return await skill.execute(context, input, dispatch, globalState);
    }

    // 3. Fallback (General Chat)
    return {
      success: true,
      message: PersonaEngine.getNaturalLanguageReply(input, context, globalState),
      suggestions: ['ExplainModule', 'AnalyzeRisk']
    };
  }
}

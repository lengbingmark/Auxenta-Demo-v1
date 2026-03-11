import { CopilotPlugin, WorkContext } from '../types';
import { BaseOverviewPlugin } from '../plugins/BaseOverviewPlugin';
import { KnowledgeEnginePlugin } from '../plugins/KnowledgeGraphPlugin';
import { DataHubPlugin } from '../plugins/DataHubPlugin';
import { ReasoningEnginePlugin } from '../plugins/ReasoningEnginePlugin';
import { UserSettingsPlugin } from '../plugins/UserSettingsPlugin';
import { InvestmentScenarioPlugin } from '../plugins/InvestmentScenarioPlugin';
import { TagCenterPlugin, ResourcePlugin } from '../plugins/CoreModulesPlugin';
import { 
  RuralOpsPlugin, 
  LowAltitudeOpsPlugin, 
  PowerOpsPlugin, 
  PoliceOpsPlugin, 
  GovPMOPlugin 
} from '../plugins/AdditionalScenariosPlugin';

class PluginManager {
  private plugins: CopilotPlugin[] = [];

  constructor() {
    this.register(BaseOverviewPlugin);
    this.register(KnowledgeEnginePlugin);
    this.register(DataHubPlugin);
    this.register(ReasoningEnginePlugin);
    this.register(TagCenterPlugin);
    this.register(ResourcePlugin);
    this.register(UserSettingsPlugin);
    
    // Scenarios
    this.register(InvestmentScenarioPlugin);
    this.register(RuralOpsPlugin);
    this.register(LowAltitudeOpsPlugin);
    this.register(PowerOpsPlugin);
    this.register(PoliceOpsPlugin);
    this.register(GovPMOPlugin);
  }

  register(plugin: CopilotPlugin) {
    this.plugins.push(plugin);
  }

  match(context: WorkContext): CopilotPlugin | null {
    // Find the first matching plugin
    // In a real system, we might have priority or scoring
    return this.plugins.find(p => p.match(context)) || null;
  }
}

export const pluginManager = new PluginManager();

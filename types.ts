export type Player = 'X' | 'O' | null;

export interface WinInfo {
  winner: Player;
  line: number[];
}

export interface AiHintResponse {
  suggestedIndex: number;
  reasoning: string;
}

import { BookOpen, Crown, Move, Shield, Swords } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GAME_VARIANTS } from '@/constants/game';
import type { GameVariant } from '@/types/game';
import { SourcesPanel } from './SourcesPanel';
import { CaptureDiagram, MovementDiagram } from './tutorial/TutorialDiagrams';

export function RulesModal({ open, onClose, variant = GAME_VARIANTS[4] }: { open: boolean; onClose: () => void; variant?: GameVariant }) {
  const circular = variant.boardType === 'circular';
  const kingCapture = variant.id === 'hnefatafl' ? 'Surround the king on four orthogonal sides, or on three sides beside the empty throne. The board edge does not count as a captor. Shieldwall captures do not take the king.' : variant.id === 'brandub' ? 'Sandwich the king between two attackers away from the throne. On the throne, four attackers are required. The empty throne is not hostile to this king.' : 'Sandwich the king between two attackers in the field. Beside the empty throne, three attackers are needed; on the throne, four attackers are needed.';
  return <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose(); }}><DialogContent className="rules-table-dialog"><DialogHeader><DialogDescription className="eyebrow">Rules of this table</DialogDescription><DialogTitle><BookOpen size={22} />{variant.name}</DialogTitle></DialogHeader>
    {circular ? <>
      <p className="rules-introduction">A modern connection game. The original medieval Irish rules of Fidchell are lost; this circular layout and ruleset are a contemporary interpretation.</p>
      <Rule title="Build a connection" icon={<Crown size={18} />}>Both colours seek an unbroken chain of adjacent pawns from the innermost ring to the outer rim. The centre stone stays empty. Ebony plays first.</Rule>
      <Rule title="Place your pawns" icon={<Shield size={18} />}>Each colour begins with 27 pawns in hand. On your turn, place one on an empty intersection. A capturing placement grants another turn.</Rule>
      <Rule title="Move along the lines" icon={<Move size={18} />}>Once your own hand is empty, slide a pawn along one ring or spoke through empty intersections. You cannot jump, change lines during a move, or cross the centre.</Rule>
      <Rule title="Capture and play again" icon={<Swords size={18} />}>Close a sandwich around an opposing pawn along a ring or spoke to remove it. During movement, the centre stone may complete the sandwich. Any capture grants one extra turn.</Rule>
    </> : <>
      <p className="rules-introduction">{variant.id === 'hnefatafl' ? 'Copenhagen core · corner escape, an armed king and shieldwall captures.' : variant.id === 'alea' ? 'A modern 19 × 19 playable interpretation, with edge escape.' : `A modern playable ${variant.boardSize} × ${variant.boardSize} reconstruction.`} Attackers take the first turn.</p>
      <Rule title="Two armies. Two aims." icon={<Crown size={18} />}>The defenders win when the king reaches <strong>{variant.defaultRules.edgeEscape ? 'any edge square' : 'one of the four corners'}</strong>. The attackers win by capturing the king or fully encircling the defenders.</Rule>
      <div className="rule-with-diagram"><Rule title="Move in straight lines" icon={<Move size={18} />}>Move one piece any number of empty squares horizontally or vertically. No diagonals and no jumping. Only the king may stop on the throne; soldiers may cross it when empty.{!variant.defaultRules.edgeEscape && ' Only the king may enter the corner squares.'}</Rule><MovementDiagram /></div>
      <div className="rule-with-diagram"><Rule title="Close the trap" icon={<Swords size={18} />}>Sandwich an enemy soldier between the piece you move and a friendly piece, or a hostile restricted square. Captures are made by closing the trap. Moving yourself between enemies is safe. {variant.defaultRules.kingArmed ? 'The king can help capture.' : 'The king cannot help capture.'}</Rule><CaptureDiagram /></div>
      <Rule title="Capturing the king" icon={<Shield size={18} />}>{kingCapture}</Rule>
      {variant.defaultRules.shieldwallCapture && <Rule title="The shieldwall" icon={<Swords size={18} />}>A line of at least two enemy soldiers on an edge can be captured when friendly pieces fully cover its inward side and you close both ends with friendly pieces or a hostile corner. The king survives a shieldwall.</Rule>}
      <p className="rules-smallprint">A player with no legal move loses. {variant.id === 'brandub' ? 'In this table, the player whose move creates a third occurrence of the same position and turn loses.' : 'This table awards an attacker win on a third occurrence of the same position and turn.'}{variant.id === 'hnefatafl' && ' Exit forts and agreed draws are not automatically adjudicated; this implements the Copenhagen core rules.'}{variant.id === 'alea' && ' The manuscript does not establish a complete ruleset; the layout and playable rules here are an interpretation.'}</p>
    </>}
    <SourcesPanel sources={variant.sources} alternates={variant.alternateRules} historianMode />
  </DialogContent></Dialog>;
}
function Rule({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="table-rule"><h3>{icon}{title}</h3><p>{children}</p></section>; }

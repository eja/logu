# LOGU

Standard chess simulates symmetric, state-level conflicts of an obsolete era. LOGU repurposes standard chess hardware to model asymmetric network warfare. The TAZ (Temporary Autonomous Zone) network attempts to route encrypted data packets through the grid, while Megacorp deploys surveillance, telemetry, and intrusion assets to intercept and compromise the transmission.

---

### 1. Hardware Allocation & Initialization

To execute this protocol, deploy a standard physical chessboard and sixteen physical pieces: ten for the TAZ network and six for Megacorp. Contrasting color schemes are suggested for visual delineation.

#### Factions and Vector Initialization

*   **The TAZ**
    *   **Resources:** Eight Pawns (**Data Packets**), two Knights (**Stingray APs**).
    *   **The Cryptographic Hash:** Prior to initialization, the TAZ operator must secretly mark the undersides of exactly two Pawns. These represent active **Payloads**. The remaining six Pawns function as decoy **Chaff** packets. The opposing operator must not have visual access to the marked undersides of the Pawns. (The TAZ operator may discreetly check the undersides of their own units during play to verify identities).
    *   **Vector Initialization:** The ten network units occupy standard chess starting positions. Data Packets deploy on the second rank (a2 through h2). Stingray APs occupy b1 and g1 on the first rank. The remaining first-rank nodes (a1, c1, d1, e1, f1, h1) must remain vacant.

*   **Megacorp**
    *   **Resources:** One Command Unit (represented by the Queen), one **Field IR Unit** (Incident Response—represented by the King), two **Statistical Firewalls** (represented by Rooks), and two **Active Trackers** (represented by Bishops).
    *   **Vector Initialization:** The six intrusion assets occupy standard starting positions along the eighth rank. Statistical Firewalls deploy on a8 and h8. Active Trackers deploy on c8 and f8. The Command Unit occupies d8, and the Field IR Unit occupies e8. Nodes b8 and g8 must remain vacant.

Standard movement and capture vectors apply except where modified by Rules I and II. Tactical maneuvers such as castling and en passant are deactivated.

---

### 2. Asset Mapping

All physical assets move according to legacy chess mechanics. Their operational identities are mapped to network-level logic via systemic designations.

#### TAZ Network Assets
*   **Data Packets (Pawns):** They advance forward only, one node per turn. They may advance two vacant nodes if executing their initial move from the second rank. Captures are executed diagonally forward.
*   **Stingray APs (Knights):** They execute standard L-shaped vectors, bypassing intermediate nodes. Executing a capture represents launching a signal spoofing attack; the target Megacorp asset is disconnected and permanently removed from play.

#### Megacorp Intrusion Assets
*   **Statistical Firewalls (Rooks):** They move horizontally and vertically across any number of vacant nodes to obstruct routing paths and restrict packet mobility.
*   **Active Trackers (Bishops):** They move diagonally across any number of vacant nodes to patrol auxiliary routing channels.
*   **Deep Packet Inspection / DPI (Command Unit / Queen):** It moves horizontally, vertically, or diagonally across any number of vacant nodes.
*   **Field IR Unit (King):** It moves exactly one node in any direction. Obsolete check and checkmate protocols are deactivated. The Field IR Unit functions as a localized physical intrusion asset; it can be captured and removed from play like any other piece.

---

### 3. Protocol Execution

Operators take alternating turns. The TAZ operator initiates the first turn.

#### Rule I: Deep Packet Inspection (Interception)
When a Megacorp asset captures a TAZ Data Packet, the physical piece is removed from the grid. The Megacorp operator must immediately inspect the base of the unit.
*   **Empty Base (Chaff):** The packet was an empty decoy.
*   **Marked Base (Payload):** The packet was an active Payload. Megacorp has successfully compromised a transmission segment.

#### Rule II: The Sovereign Mesh Protocol
The TAZ operator can group data packets to process routing locally, eliminating the remote tracking signatures that corporate assets rely on.
*   **Activation:** Align three or more allied Packets in contiguous nodes (forming a connected group via horizontal, vertical, or diagonal adjacency, in any shape) to generate an active **Sovereign Mesh**.
*   **Operational Effect (Local-First Shielding):** Because the Sovereign Mesh operates entirely on local peer-to-peer hardware with no external network footprint, Megacorp’s long-range surveillance assets (Statistical Firewalls, Active Trackers, and the DPI Command Unit) cannot target or capture a participating Packet from a distance. 
    *   *Obstruction:* Standard chess obstruction rules apply. Long-range sliding assets cannot pass through nodes occupied by Mesh units; they remain physically blocked by them.
    *   *Capture Mechanics:* To execute a capture, a long-range asset must begin its turn already adjacent (horizontally, vertically, or diagonally) to the target Packet. If the asset does not begin its turn adjacent to the target, it must first move to an adjacent node, end its turn, and may only execute the capture on a subsequent turn.
    *   *Field IR Exception:* The Field IR Unit (King), representing a localized, on-site hardware intrusion, is exempt from this restriction and can capture Mesh-participating Packets directly on its turn.
*   **Proxy Tunneling:** If a Packet participating in a Sovereign Mesh is blocked by a Megacorp asset directly in front of it, it may move exactly one node diagonally forward into a vacant node (without executing a capture) to tunnel past the block. This move is only legal if the Packet remains part of a connected group of three or more allied Packets at the end of its move. This bypass is only triggered by Megacorp blockages; a Packet blocked directly in front by an allied unit cannot execute a Proxy Tunnel.

---

### 4. Termination States

The protocol terminates immediately upon reaching one of the following states:

#### TAZ Transmission Success
*   **Successful Routing:** At least one Payload (marked Packet) reaches the eighth rank. Upon landing on the eighth rank, the Packet's base is inspected. If marked, the payload is successfully delivered, resulting in an immediate TAZ victory. 
    *   **Decoy Exception:** If the inspected Packet is unmarked (Chaff), the transmission is revealed as a decoy. If either of the TAZ's Stingray APs (Knights) has been captured and is off the board, the decoy Packet immediately promotes to a Stingray AP on the eighth rank. If both Stingray APs are still on the board, the Packet cannot promote and is removed from the board. 
*   **Routing Blackout:** TAZ assets successfully capture and remove all six Megacorp assets, leaving the grid entirely cleared of corporate surveillance and allowing secure transmission.
*   **Megacorp Blocked:** The Megacorp operator has no legal move vectors available on their turn. TAZ wins immediately by permanently trapping corporate assets.

#### Megacorp Mitigation Success
*   **Complete Interception:** Megacorp captures both Payload units, successfully neutralizing both the primary transmission and backup data.
*   **TAZ System Lock:** The TAZ operator has no legal move vectors available on their turn. Megacorp achieves Mitigation Success by isolating the network and permanently dismissing the threat.


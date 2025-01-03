// Interfaces
interface IMatchObserver {
  update(ball: Ball): void;
}

interface IStatsManager {
  updateStats(ball: Ball): void;
  getHighestWicketTaker(): Player;
  getHighestCenturyScorer(matchType: MatchType): Player;
  getPlayerStats(player: Player): PlayerStats;
}

// Enums
enum BallType {
  NORMAL,
  WIDE,
  NO_BALL,
  WICKET,
}

enum WicketType {
  CAUGHT,
  BOWLED,
  LBW,
  RUN_OUT,
  STUMPED,
}

enum Role {
  WICKETKEEPER,
  CAPTAIN,
  VICE_CAPTAIN,
}

enum PlayerType {
  BATSMAN,
  BOWLER,
  ALLROUNDER,
}

enum MatchType {
  ODI,
  TEST,
  T20,
}

enum MatchState {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED,
  ABANDONED,
}

// Stats Classes
class PlayerStats {
  public totalRuns: number = 0;
  public totalWickets: number = 0;
  public centuries: number = 0;
  public halfCenturies: number = 0;
  public matches: number = 0;
  public matchTypeStats: Map<MatchType, MatchTypeStats> = new Map();

  public updateBattingStats(runs: number): void {
    this.totalRuns += runs;
    if (runs >= 100) this.centuries++;
    else if (runs >= 50) this.halfCenturies++;
  }

  public addWicket(): void {
    this.totalWickets++;
  }
}

class MatchTypeStats {
  public runs: number = 0;
  public wickets: number = 0;
  public matches: number = 0;
  public centuries: number = 0;
  public halfCenturies: number = 0;
}

// Core Classes
class Ball {
  constructor(
    private overNumber: number,
    private ballType: BallType,
    private ballResultRuns: number,
    private ballNumber: number,
    private bowler: Player,
    private batsman: Player,
    private isWicket: boolean,
    private extraRuns: number = 0,
    private commentary: string = "",
    private wicketType?: WicketType
  ) {}

  public getBallResultRuns(): number {
    return this.ballResultRuns + this.extraRuns;
  }

  public getIsWicket(): boolean {
    return this.isWicket;
  }

  public getBowler(): Player {
    return this.bowler;
  }

  public getBatsman(): Player {
    return this.batsman;
  }

  public getWicketType(): WicketType | undefined {
    return this.wicketType;
  }
}

class Player {
  private stats: PlayerStats;

  constructor(
    private name: string,
    private age: number,
    private role: Role[],
    private battingStyle: string | null,
    private bowlingStyle: string | null,
    private country: string,
    private type: PlayerType
  ) {
    this.stats = new PlayerStats();
  }

  // Add getter methods
  public getName(): string {
    return this.name;
  }

  public getAge(): number {
    return this.age;
  }

  public getRoles(): Role[] {
    return [...this.role];
  }

  public getBattingStyle(): string | null {
    return this.battingStyle;
  }

  public getBowlingStyle(): string | null {
    return this.bowlingStyle;
  }

  public getCountry(): string {
    return this.country;
  }

  public getType(): PlayerType {
    return this.type;
  }

  public getStats(): PlayerStats {
    return this.stats;
  }

  // Add setter methods
  public setName(name: string): void {
    this.name = name;
  }

  public setAge(age: number): void {
    this.age = age;
  }

  public addRole(role: Role): void {
    if (!this.role.includes(role)) {
      this.role.push(role);
    }
  }

  public removeRole(role: Role): void {
    this.role = this.role.filter((r) => r !== role);
  }

  public setBattingStyle(style: string): void {
    this.battingStyle = style;
  }

  public setBowlingStyle(style: string): void {
    this.bowlingStyle = style;
  }

  public setCountry(country: string): void {
    this.country = country;
  }

  public setType(type: PlayerType): void {
    this.type = type;
  }
}

class Team {
  private currentPlaying11: Set<Player> = new Set();

  constructor(
    private name: string,
    private squad: Player[],
    private captain: Player,
    private viceCaptain: Player
  ) {}

  public setPlaying11(players: Player[]): boolean {
    if (players.length !== 11) return false;
    if (!players.every((p) => this.squad.includes(p))) return false;

    this.currentPlaying11.clear();
    players.forEach((p) => this.currentPlaying11.add(p));
    return true;
  }

  public isInPlaying11(player: Player): boolean {
    return this.currentPlaying11.has(player);
  }
}

class StatsManager implements IStatsManager, IMatchObserver {
  private playerStats: Map<Player, PlayerStats> = new Map();

  public updateStats(ball: Ball): void {
    const batsman = ball.getBatsman();
    const bowler = ball.getBowler();

    let batsmanStats = this.getOrCreatePlayerStats(batsman);
    let bowlerStats = this.getOrCreatePlayerStats(bowler);

    batsmanStats.updateBattingStats(ball.getBallResultRuns());
    if (ball.getIsWicket()) {
      bowlerStats.addWicket();
    }
  }

  private getOrCreatePlayerStats(player: Player): PlayerStats {
    if (!this.playerStats.has(player)) {
      this.playerStats.set(player, new PlayerStats());
    }
    return this.playerStats.get(player)!;
  }

  public getHighestWicketTaker(): Player {
    let maxWickets = 0;
    let highestWicketTaker: Player | null = null;

    this.playerStats.forEach((stats, player) => {
      if (stats.totalWickets > maxWickets) {
        maxWickets = stats.totalWickets;
        highestWicketTaker = player;
      }
    });

    if (!highestWicketTaker) throw new Error("No players found");
    return highestWicketTaker;
  }

  public getHighestCenturyScorer(matchType: MatchType): Player {
    let maxCenturies = 0;
    let highestScorer: Player | null = null;

    this.playerStats.forEach((stats, player) => {
      const matchTypeStats = stats.matchTypeStats.get(matchType);
      if (matchTypeStats && matchTypeStats.centuries > maxCenturies) {
        maxCenturies = matchTypeStats.centuries;
        highestScorer = player;
      }
    });

    if (!highestScorer) throw new Error("No players found");
    return highestScorer;
  }

  public getPlayerStats(player: Player): PlayerStats {
    return this.getOrCreatePlayerStats(player);
  }

  public update(ball: Ball): void {
    this.updateStats(ball);
  }
}

abstract class Match {
  protected observers: IMatchObserver[] = [];
  protected statsManager: StatsManager;
  protected state: MatchState = MatchState.NOT_STARTED;

  constructor(
    protected team1: Team,
    protected team2: Team,
    protected umpires: Umpire[],
    protected stadium: Stadium,
    protected totalOvers: number | null,
    protected currentScore: Score = new Score(0, 0, 0, 0),
    protected balls: Ball[] = []
  ) {
    this.statsManager = new StatsManager();
  }

  public addObserver(observer: IMatchObserver): void {
    this.observers.push(observer);
  }

  public addBall(ball: Ball): void {
    if (this.state !== MatchState.IN_PROGRESS) {
      throw new Error("Match is not in progress");
    }

    this.balls.push(ball);
    this.currentScore = this.currentScore.updateScore(ball);
    this.notifyObservers(ball);
    this.statsManager.updateStats(ball);
  }

  protected notifyObservers(ball: Ball): void {
    this.observers.forEach((observer) => observer.update(ball));
  }

  public startMatch(): void {
    this.state = MatchState.IN_PROGRESS;
  }

  public endMatch(): void {
    this.state = MatchState.COMPLETED;
  }

  abstract validateMatchRules(): boolean;

  public initializeMatch(): void {
    // Add commentators as observers
    this.addCommentators();
    // Add stats manager as observer
    this.addStatsObserver();
    this.startMatch();
  }

  private addCommentators(): void {
    // Get commentators assigned to this match
    const matchCommentators = this.getAssignedCommentators();
    matchCommentators.forEach((commentator) => {
      this.addObserver(commentator);
    });
  }

  private addStatsObserver(): void {
    this.addObserver(this.statsManager);
  }

  protected getAssignedCommentators(): Commentator[] {
    // This would typically be set during match creation
    // For now, returning empty array
    return [];
  }
}

class Tournament {
  private matches: Match[] = [];
  private teams: Map<Team, Player[]> = new Map();
  private statsManager: StatsManager;

  constructor(
    private name: string,
    private startDate: Date,
    private endDate: Date,
    private matchType: MatchType
  ) {
    this.statsManager = new StatsManager();
  }

  public addTeamSquad(team: Team, squad: Player[]): boolean {
    if (squad.length < 15) return false; // Minimum squad size
    this.teams.set(team, squad);
    return true;
  }

  public addMatch(match: Match): void {
    this.matches.push(match);
  }

  public getStats(): StatsManager {
    return this.statsManager;
  }
}

// Factory for creating matches
class MatchFactory {
  public static createMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium
  ): Match {
    switch (matchType) {
      case MatchType.T20:
        return new T20Match(team1, team2, umpires, stadium);
      case MatchType.ODI:
        return new ODIMatch(team1, team2, umpires, stadium);
      case MatchType.TEST:
        return new TestMatch(team1, team2, umpires, stadium);
      default:
        throw new Error("Invalid match type");
    }
  }
}

// Main CrickInfo class
class CrickInfo {
  private tournaments: Tournament[] = [];
  private globalStatsManager: StatsManager;

  constructor(
    private teams: Team[],
    private matches: Match[],
    private commentators: Commentator[],
    private stadiums: Stadium[],
    private umpires: Umpire[]
  ) {
    this.globalStatsManager = new StatsManager();
  }

  public createTournament(
    name: string,
    startDate: Date,
    endDate: Date,
    matchType: MatchType
  ): Tournament {
    const tournament = new Tournament(name, startDate, endDate, matchType);
    this.tournaments.push(tournament);
    return tournament;
  }

  public getGlobalStats(): StatsManager {
    return this.globalStatsManager;
  }
}

// Add Score class
class Score {
  constructor(
    private runs: number,
    private wickets: number,
    private overs: number,
    private balls: number
  ) {}

  public updateScore(ball: Ball): Score {
    let newRuns = this.runs + ball.getBallResultRuns();
    let newWickets = ball.getIsWicket() ? this.wickets + 1 : this.wickets;
    let newBalls = this.balls + 1;
    let newOvers = this.overs;

    if (newBalls === 6) {
      newOvers++;
      newBalls = 0;
    }

    return new Score(newRuns, newWickets, newOvers, newBalls);
  }

  public getRuns(): number {
    return this.runs;
  }

  public getWickets(): number {
    return this.wickets;
  }

  public getOvers(): number {
    return this.overs + this.balls / 6;
  }
}

// Add Stadium class
class Stadium {
  constructor(
    private name: string,
    private location: string,
    private capacity: number,
    private dimensions: { length: number; width: number }
  ) {}

  public getName(): string {
    return this.name;
  }

  public getLocation(): string {
    return this.location;
  }

  public getCapacity(): number {
    return this.capacity;
  }
}

// Add Umpire class
class Umpire {
  constructor(
    private name: string,
    private country: string,
    private matchesOfficiated: number,
    private iccRanking: number
  ) {}

  public getName(): string {
    return this.name;
  }

  public getMatchesOfficiated(): number {
    return this.matchesOfficiated;
  }

  public incrementMatchesOfficiated(): void {
    this.matchesOfficiated++;
  }
}

// Add Commentator class
class Commentator implements IMatchObserver {
  private currentCommentary: string = "";

  constructor(
    private name: string,
    private language: string,
    private experienceYears: number
  ) {}

  public update(ball: Ball): void {
    // Generate commentary based on ball details
    this.generateCommentary(ball);
  }

  private generateCommentary(ball: Ball): void {
    let commentary = `${ball.getBowler().getName()} bowls to ${ball
      .getBatsman()
      .getName()}. `;

    if (ball.getIsWicket()) {
      commentary += `WICKET! ${ball
        .getBatsman()
        .getName()} is out ${ball.getWicketType()}!`;
    } else {
      commentary += `${ball.getBallResultRuns()} runs scored.`;
    }

    this.currentCommentary = commentary;
  }

  public getCurrentCommentary(): string {
    return this.currentCommentary;
  }
}

// Add specific match type implementations
class T20Match extends Match {
  constructor(team1: Team, team2: Team, umpires: Umpire[], stadium: Stadium) {
    super(team1, team2, umpires, stadium, 20); // T20 has 20 overs
  }

  public validateMatchRules(): boolean {
    // Implement T20 specific rules
    return this.totalOvers === 20;
  }
}

class ODIMatch extends Match {
  constructor(team1: Team, team2: Team, umpires: Umpire[], stadium: Stadium) {
    super(team1, team2, umpires, stadium, 50); // ODI has 50 overs
  }

  public validateMatchRules(): boolean {
    // Implement ODI specific rules
    return this.totalOvers === 50;
  }
}

class TestMatch extends Match {
  private maxDays: number = 5;
  private currentDay: number = 1;

  constructor(team1: Team, team2: Team, umpires: Umpire[], stadium: Stadium) {
    super(team1, team2, umpires, stadium, null); // Test matches don't have over limits
  }

  public validateMatchRules(): boolean {
    // Implement Test match specific rules
    return this.currentDay <= this.maxDays;
  }

  public nextDay(): void {
    if (this.currentDay < this.maxDays) {
      this.currentDay++;
    } else {
      this.endMatch();
    }
  }
}

// Add Admin class to manage system
class Admin {
  constructor(private cricInfo: CrickInfo) {}

  public createMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium
  ): Match {
    return MatchFactory.createMatch(matchType, team1, team2, umpires, stadium);
  }

  public createTournament(
    name: string,
    startDate: Date,
    endDate: Date,
    matchType: MatchType
  ): Tournament {
    return this.cricInfo.createTournament(name, startDate, endDate, matchType);
  }

  public addBallToMatch(match: Match, ball: Ball): void {
    match.addBall(ball);
  }

  public createAndInitializeMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium,
    commentators: Commentator[]
  ): Match {
    const match = MatchFactory.createMatch(
      matchType,
      team1,
      team2,
      umpires,
      stadium
    );

    // Add commentators as observers
    commentators.forEach((commentator) => {
      match.addObserver(commentator);
    });

    // Initialize the match
    match.initializeMatch();

    return match;
  }
}

// Add Over class to manage overs
class Over {
  private balls: Ball[] = [];

  constructor(private overNumber: number) {}

  public addBall(ball: Ball): boolean {
    if (this.balls.length >= 6) return false;
    this.balls.push(ball);
    return true;
  }

  public isComplete(): boolean {
    return this.balls.length === 6;
  }

  public getRunsInOver(): number {
    return this.balls.reduce((sum, ball) => sum + ball.getBallResultRuns(), 0);
  }

  public getWicketsInOver(): number {
    return this.balls.filter((ball) => ball.getIsWicket()).length;
  }
}

// Add Innings class
class Innings {
  private overs: Over[] = [];
  private currentOver: Over;
  private score: Score;

  constructor(
    private battingTeam: Team,
    private bowlingTeam: Team,
    private maxOvers: number | null
  ) {
    this.currentOver = new Over(0);
    this.score = new Score(0, 0, 0, 0);
  }

  public addBall(ball: Ball): boolean {
    if (this.currentOver.isComplete()) {
      this.overs.push(this.currentOver);
      this.currentOver = new Over(this.overs.length);
    }

    if (this.maxOvers && this.overs.length >= this.maxOvers) {
      return false;
    }

    return this.currentOver.addBall(ball);
  }

  public getScore(): Score {
    return this.score;
  }
}

// Example usage:
class CrickInfoExample {
  public static demonstrateMatchCreation(): void {
    // Create required objects
    const team1 = new Team(
      "India",
      [],
      /* captain */ {} as Player,
      /* viceCaptain */ {} as Player
    );
    const team2 = new Team(
      "Australia",
      [],
      /* captain */ {} as Player,
      /* viceCaptain */ {} as Player
    );
    const umpires = [new Umpire("John Doe", "England", 100, 1)];
    const stadium = new Stadium("MCG", "Melbourne", 100000, {
      length: 171,
      width: 146,
    });

    // Create commentators
    const commentators = [
      new Commentator("Tony Greig", "English", 20),
      new Commentator("Harsha Bhogle", "English", 30),
    ];

    // Create CrickInfo instance
    const cricInfo = new CrickInfo([], [], [], [], []);
    const admin = new Admin(cricInfo);

    // Create and initialize match with observers
    const match = admin.createAndInitializeMatch(
      MatchType.ODI,
      team1,
      team2,
      umpires,
      stadium,
      commentators
    );

    // Simulate a ball being bowled
    const ball = new Ball(
      1, // over number
      BallType.NORMAL,
      4, // runs scored
      1, // ball number
      {} as Player, // bowler
      {} as Player, // batsman
      false // not a wicket
    );

    // Add ball to match - this will notify all observers
    admin.addBallToMatch(match, ball);
  }
}

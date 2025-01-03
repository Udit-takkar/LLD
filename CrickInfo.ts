// Interfaces
interface IMatchObserver {
  update(ball: Ball): void;
}

interface IStatsManager extends IMatchObserver {
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
  constructor(
    private name: string,
    private players: Player[],
    private captain: Player,
    private viceCaptain: Player,
    private coach: string = "",
    private homeGround: Stadium | null = null
  ) {}

  public getName(): string {
    return this.name;
  }

  public getPlayers(): Player[] {
    return [...this.players]; // Return a copy to maintain encapsulation
  }

  public getCaptain(): Player {
    return this.captain;
  }

  public getViceCaptain(): Player {
    return this.viceCaptain;
  }

  public getCoach(): string {
    return this.coach;
  }

  public getHomeGround(): Stadium | null {
    return this.homeGround;
  }

  public addPlayer(player: Player): boolean {
    if (this.players.includes(player)) {
      return false;
    }
    this.players.push(player);
    return true;
  }

  public removePlayer(player: Player): boolean {
    const index = this.players.indexOf(player);
    if (index === -1) {
      return false;
    }
    this.players.splice(index, 1);
    return true;
  }

  public setCoach(coach: string): void {
    this.coach = coach;
  }

  public setHomeGround(stadium: Stadium): void {
    this.homeGround = stadium;
  }

  public setCaptain(player: Player): boolean {
    if (!this.players.includes(player)) {
      return false;
    }
    this.captain = player;
    return true;
  }

  public setViceCaptain(player: Player): boolean {
    if (!this.players.includes(player)) {
      return false;
    }
    this.viceCaptain = player;
    return true;
  }

  public getPlayingEleven(): Player[] | null {
    // This would be set before each match
    // Implementation depends on your specific requirements
    return null;
  }

  public setPlayingEleven(players: Player[]): boolean {
    if (players.length !== 11) {
      return false;
    }

    // Verify all players are part of the team
    if (!players.every((player) => this.players.includes(player))) {
      return false;
    }

    // Additional validation could be added here
    // For example, ensuring at least one wicket keeper, etc.

    return true;
  }

  public getTournamentSquad(tournament: Tournament): Player[] {
    // This would return the squad registered for a specific tournament
    // Implementation depends on your specific requirements
    return [];
  }

  public registerTournamentSquad(
    tournament: Tournament,
    squad: Player[]
  ): boolean {
    // Validate and register squad for tournament
    // Implementation depends on your specific requirements
    if (!squad.every((player) => this.players.includes(player))) {
      return false;
    }
    return true;
  }

  public getStats(): TeamStats {
    // Return team statistics
    // Implementation depends on your specific requirements
    return new TeamStats();
  }
}

// Add TeamStats class for team statistics
class TeamStats {
  constructor(
    public matchesPlayed: number = 0,
    public matchesWon: number = 0,
    public matchesLost: number = 0,
    public matchesDrawn: number = 0,
    public totalRuns: number = 0,
    public totalWickets: number = 0
  ) {}

  public getWinPercentage(): number {
    if (this.matchesPlayed === 0) return 0;
    return (this.matchesWon / this.matchesPlayed) * 100;
  }

  public updateStats(match: Match, isWinner: boolean): void {
    this.matchesPlayed++;
    if (isWinner) {
      this.matchesWon++;
    } else if (match.getState() === MatchState.COMPLETED) {
      this.matchesLost++;
    } else {
      this.matchesDrawn++;
    }
  }
}

class StatsManager implements IStatsManager {
  private playerStats: Map<Player, PlayerStats> = new Map();

  public update(ball: Ball): void {
    this.updateStats(ball);
  }

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
}

// Abstract Match class
abstract class Match {
  protected observers: IMatchObserver[] = [];
  protected statsManager: StatsManager;
  protected state: MatchState = MatchState.NOT_STARTED;
  protected currentInnings: Innings | null = null;
  protected innings: Innings[] = [];

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

    if (!this.currentInnings) {
      throw new Error("No innings in progress");
    }

    if (!this.currentInnings.addBall(ball)) {
      throw new Error("Cannot add ball to current innings");
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
    if (this.state !== MatchState.NOT_STARTED) {
      throw new Error("Match can only be started from NOT_STARTED state");
    }
    this.state = MatchState.IN_PROGRESS;
    this.startNewInnings(this.team1, this.team2);
  }

  public endMatch(): void {
    this.state = MatchState.COMPLETED;
  }

  protected startNewInnings(battingTeam: Team, bowlingTeam: Team): void {
    const targetScore =
      this.innings.length > 0
        ? this.innings[0].getScore().getRuns() + 1
        : undefined;

    this.currentInnings = new Innings(
      battingTeam,
      bowlingTeam,
      this.totalOvers,
      targetScore
    );
    this.innings.push(this.currentInnings);
  }

  public getCurrentScore(): Score {
    return this.currentScore;
  }

  public getState(): MatchState {
    return this.state;
  }

  public getCurrentInnings(): Innings | null {
    return this.currentInnings;
  }

  public getTeam1(): Team {
    return this.team1;
  }

  public getTeam2(): Team {
    return this.team2;
  }

  public getUmpires(): Umpire[] {
    return [...this.umpires];
  }

  public getStadium(): Stadium {
    return this.stadium;
  }

  abstract validateMatchRules(): boolean;
}

// Match type implementations remain the same
class T20Match extends Match {
  constructor(team1: Team, team2: Team, umpires: Umpire[], stadium: Stadium) {
    super(team1, team2, umpires, stadium, 20); // T20 has 20 overs
  }

  public validateMatchRules(): boolean {
    return this.totalOvers === 20;
  }
}

class ODIMatch extends Match {
  constructor(team1: Team, team2: Team, umpires: Umpire[], stadium: Stadium) {
    super(team1, team2, umpires, stadium, 50); // ODI has 50 overs
  }

  public validateMatchRules(): boolean {
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

// Add service interfaces
interface IMatchService {
  createMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium
  ): Match;
  initializeMatch(match: Match, commentators: Commentator[]): void;
  addBall(match: Match, ball: Ball): void;
}

interface ITournamentService {
  createTournament(
    name: string,
    startDate: Date,
    endDate: Date,
    matchType: MatchType
  ): Tournament;
  addTeamToTournament(
    tournament: Tournament,
    team: Team,
    squad: Player[]
  ): boolean;
}

interface IStatsService {
  updateStats(ball: Ball): void;
  getGlobalStats(): StatsManager;
  getTournamentStats(tournament: Tournament): StatsManager;
}

// Add service implementations
class MatchService implements IMatchService {
  constructor(private statsManager: IStatsManager) {}

  public createMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium
  ): Match {
    return MatchFactory.createMatch(matchType, team1, team2, umpires, stadium);
  }

  public initializeMatch(match: Match, commentators: Commentator[]): void {
    // Add commentators as observers
    commentators.forEach((commentator) => match.addObserver(commentator));

    // Add stats manager as observer
    match.addObserver(this.statsManager);

    match.startMatch();
  }

  public addBall(match: Match, ball: Ball): void {
    match.addBall(ball);
  }
}

class TournamentService implements ITournamentService {
  constructor(private statsManager: IStatsManager) {}

  public createTournament(
    name: string,
    startDate: Date,
    endDate: Date,
    matchType: MatchType
  ): Tournament {
    return new Tournament(name, startDate, endDate, matchType);
  }

  public addTeamToTournament(
    tournament: Tournament,
    team: Team,
    squad: Player[]
  ): boolean {
    return tournament.addTeamSquad(team, squad);
  }
}

class StatsService implements IStatsService {
  constructor(
    private globalStatsManager: StatsManager,
    private tournamentStats: Map<Tournament, StatsManager>
  ) {}

  public updateStats(ball: Ball): void {
    this.globalStatsManager.updateStats(ball);
  }

  public getGlobalStats(): StatsManager {
    return this.globalStatsManager;
  }

  public getTournamentStats(tournament: Tournament): StatsManager {
    if (!this.tournamentStats.has(tournament)) {
      this.tournamentStats.set(tournament, new StatsManager());
    }
    return this.tournamentStats.get(tournament)!;
  }
}

// Update Admin class to use services
class Admin {
  constructor(
    private matchService: IMatchService,
    private tournamentService: ITournamentService,
    private statsService: IStatsService
  ) {}

  public createAndInitializeMatch(
    matchType: MatchType,
    team1: Team,
    team2: Team,
    umpires: Umpire[],
    stadium: Stadium,
    commentators: Commentator[]
  ): Match {
    const match = this.matchService.createMatch(
      matchType,
      team1,
      team2,
      umpires,
      stadium
    );
    this.matchService.initializeMatch(match, commentators);
    return match;
  }

  public createTournament(
    name: string,
    startDate: Date,
    endDate: Date,
    matchType: MatchType
  ): Tournament {
    return this.tournamentService.createTournament(
      name,
      startDate,
      endDate,
      matchType
    );
  }

  public addBallToMatch(match: Match, ball: Ball): void {
    this.matchService.addBall(match, ball);
  }
}

// Update CrickInfo class to use dependency injection
class CrickInfo {
  private matchService: IMatchService;
  private tournamentService: ITournamentService;
  private statsService: IStatsService;

  constructor(
    private teams: Team[],
    private matches: Match[],
    private commentators: Commentator[],
    private stadiums: Stadium[],
    private umpires: Umpire[]
  ) {
    const globalStatsManager = new StatsManager();
    const tournamentStats = new Map<Tournament, StatsManager>();

    this.statsService = new StatsService(globalStatsManager, tournamentStats);
    this.matchService = new MatchService(globalStatsManager);
    this.tournamentService = new TournamentService(globalStatsManager);
  }

  public getAdmin(): Admin {
    return new Admin(
      this.matchService,
      this.tournamentService,
      this.statsService
    );
  }
}

// Example usage with reduced coupling
class CrickInfoExample {
  public static demonstrateMatchCreation(): void {
    // Create required objects
    const captain1 = new Player(
      "Virat Kohli",
      32,
      [Role.CAPTAIN],
      "Right Hand",
      null,
      "India",
      PlayerType.BATSMAN
    );
    const viceCaptain1 = new Player(
      "Rohit Sharma",
      34,
      [Role.VICE_CAPTAIN],
      "Right Hand",
      null,
      "India",
      PlayerType.BATSMAN
    );
    const captain2 = new Player(
      "Pat Cummins",
      28,
      [Role.CAPTAIN],
      "Right Hand",
      "Right Arm Fast",
      "Australia",
      PlayerType.BOWLER
    );
    const viceCaptain2 = new Player(
      "Steve Smith",
      32,
      [Role.VICE_CAPTAIN],
      "Right Hand",
      null,
      "Australia",
      PlayerType.BATSMAN
    );

    const team1 = new Team("India", [], captain1, viceCaptain1);
    const team2 = new Team("Australia", [], captain2, viceCaptain2);
    const umpires = [
      new Umpire("John Doe", "England", 100, 1, "john@icc.com", "+44123456789"),
    ];
    const stadium = new Stadium("MCG", "Melbourne", 100000, {
      length: 171,
      width: 146,
    });
    const commentators = [
      new Commentator(
        "Tony Greig",
        "England",
        20,
        ["English"],
        "tony@cricket.com",
        "+44987654321"
      ),
      new Commentator(
        "Harsha Bhogle",
        "India",
        30,
        ["English", "Hindi"],
        "harsha@cricket.com",
        "+911234567890"
      ),
    ];

    // Create CrickInfo instance with dependencies
    const cricInfo = new CrickInfo([], [], [], [], []);
    const admin = cricInfo.getAdmin();

    // Create and initialize match using services
    const match = admin.createAndInitializeMatch(
      MatchType.ODI,
      team1,
      team2,
      umpires,
      stadium,
      commentators
    );

    // Create ball with proper Player objects
    const bowler = new Player(
      "Mitchell Starc",
      31,
      [],
      null,
      "Left Arm Fast",
      "Australia",
      PlayerType.BOWLER
    );
    const batsman = new Player(
      "KL Rahul",
      29,
      [],
      "Right Hand",
      null,
      "India",
      PlayerType.BATSMAN
    );

    const ball = new Ball(
      1, // over number
      BallType.NORMAL,
      4, // runs scored
      1, // ball number
      bowler,
      batsman,
      false // not a wicket
    );

    // Add ball using service
    admin.addBallToMatch(match, ball);
  }
}

// Rename Person to CricketPerson
abstract class CricketPerson {
  constructor(
    protected name: string,
    protected country: string,
    protected email: string = "",
    protected phone: string = ""
  ) {}

  public getName(): string {
    return this.name;
  }

  public getCountry(): string {
    return this.country;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPhone(): string {
    return this.phone;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setPhone(phone: string): void {
    this.phone = phone;
  }
}

// Update Commentator to extend CricketPerson
class Commentator extends CricketPerson implements IMatchObserver {
  private currentCommentary: string = "";

  constructor(
    name: string,
    country: string,
    private experienceYears: number,
    private languages: string[] = ["English"],
    email: string = "",
    phone: string = ""
  ) {
    super(name, country, email, phone);
  }

  public update(ball: Ball): void {
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
    } else if (ball.getBallResultRuns() > 0) {
      commentary += `${ball.getBallResultRuns()} runs scored.`;
    } else {
      commentary += "No run.";
    }

    this.currentCommentary = commentary;
  }

  public getCurrentCommentary(): string {
    return this.currentCommentary;
  }

  public getExperienceYears(): number {
    return this.experienceYears;
  }

  public getLanguages(): string[] {
    return [...this.languages];
  }

  public addLanguage(language: string): void {
    if (!this.languages.includes(language)) {
      this.languages.push(language);
    }
  }
}

// Update Umpire to extend CricketPerson
class Umpire extends CricketPerson {
  constructor(
    name: string,
    country: string,
    private matchesOfficiated: number,
    private iccRanking: number,
    email: string = "",
    phone: string = ""
  ) {
    super(name, country, email, phone);
  }

  public getMatchesOfficiated(): number {
    return this.matchesOfficiated;
  }

  public getIccRanking(): number {
    return this.iccRanking;
  }

  public incrementMatchesOfficiated(): void {
    this.matchesOfficiated++;
  }

  public updateIccRanking(newRanking: number): void {
    this.iccRanking = newRanking;
  }
}

// Add Stadium class
class Stadium {
  private matches: Match[] = [];

  constructor(
    private name: string,
    private location: string,
    private capacity: number,
    private dimensions: { length: number; width: number },
    private facilities: string[] = []
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

  public getDimensions(): { length: number; width: number } {
    return { ...this.dimensions };
  }

  public getFacilities(): string[] {
    return [...this.facilities];
  }

  public addFacility(facility: string): void {
    if (!this.facilities.includes(facility)) {
      this.facilities.push(facility);
    }
  }

  public addMatch(match: Match): void {
    this.matches.push(match);
  }

  public getMatchHistory(): Match[] {
    return [...this.matches];
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

// Add Innings related interfaces
interface IInnings {
  addBall(ball: Ball): boolean;
  getScore(): Score;
  getCurrentBatsmen(): Player[];
  getCurrentBowler(): Player;
  isComplete(): boolean;
}

interface IInningsState {
  canAddBall(): boolean;
  handleBall(innings: Innings, ball: Ball): boolean;
}

// Add Innings class
class Innings implements IInnings {
  private overs: Over[] = [];
  private currentOver: Over;
  private score: Score;
  private wickets: number = 0;
  private battingOrder: Player[] = [];
  private currentBatsmen: Player[] = [];
  private currentBowler: Player | null = null;
  private state: IInningsState;

  constructor(
    private battingTeam: Team,
    private bowlingTeam: Team,
    private maxOvers: number | null,
    private targetScore?: number
  ) {
    this.currentOver = new Over(0);
    this.score = new Score(0, 0, 0, 0);
    this.state = new InningsInProgressState();
  }

  public addBall(ball: Ball): boolean {
    if (!this.state.canAddBall()) {
      return false;
    }

    if (this.currentOver.isComplete()) {
      this.overs.push(this.currentOver);
      this.currentOver = new Over(this.overs.length);
      this.rotateBowler();
    }

    const result = this.currentOver.addBall(ball);
    if (result) {
      this.updateScore(ball);
      this.updateBattingOrder(ball);
    }

    this.checkInningsState();
    return result;
  }

  private updateScore(ball: Ball): void {
    this.score = this.score.updateScore(ball);
    if (ball.getIsWicket()) {
      this.wickets++;
    }
  }

  private updateBattingOrder(ball: Ball): void {
    const batsman = ball.getBatsman();
    if (!this.battingOrder.includes(batsman)) {
      this.battingOrder.push(batsman);
    }

    if (ball.getIsWicket()) {
      this.rotateBatsmen();
    } else if (ball.getBallResultRuns() % 2 === 1) {
      this.rotateStrike();
    }
  }

  private rotateBatsmen(): void {
    if (this.wickets < 10) {
      // Get next batsman from team who hasn't batted yet
      const availableBatsmen = this.battingTeam
        .getPlayers()
        .filter((player) => !this.battingOrder.includes(player));
      if (availableBatsmen.length > 0) {
        this.currentBatsmen[this.currentBatsmen.indexOf(this.getOutBatsman())] =
          availableBatsmen[0];
      }
    }
  }

  private rotateStrike(): void {
    this.currentBatsmen.reverse();
  }

  private rotateBowler(): void {
    // Get a different bowler from the bowling team
    const availableBowlers = this.bowlingTeam
      .getPlayers()
      .filter(
        (player) =>
          player !== this.currentBowler && player.getBowlingStyle() !== null
      );
    if (availableBowlers.length > 0) {
      this.currentBowler = availableBowlers[0];
    }
  }

  private checkInningsState(): void {
    if (this.wickets >= 10) {
      this.state = new InningsCompletedState();
    } else if (this.maxOvers && this.getOvers() >= this.maxOvers) {
      this.state = new InningsCompletedState();
    } else if (this.targetScore && this.score.getRuns() > this.targetScore) {
      this.state = new InningsCompletedState();
    }
  }

  public getScore(): Score {
    return this.score;
  }

  public getCurrentBatsmen(): Player[] {
    return [...this.currentBatsmen];
  }

  public getCurrentBowler(): Player {
    if (!this.currentBowler) {
      throw new Error("No bowler assigned");
    }
    return this.currentBowler;
  }

  public isComplete(): boolean {
    return this.state instanceof InningsCompletedState;
  }

  private getOvers(): number {
    return this.overs.length + (this.currentOver.isComplete() ? 1 : 0);
  }

  private getOutBatsman(): Player {
    // Return the batsman who got out (implementation depends on your needs)
    return this.currentBatsmen[0];
  }
}

// Add Over class
class Over {
  private balls: Ball[] = [];
  private readonly MAX_BALLS: number = 6;

  constructor(private overNumber: number) {}

  public addBall(ball: Ball): boolean {
    if (this.isComplete()) {
      return false;
    }
    this.balls.push(ball);
    return true;
  }

  public isComplete(): boolean {
    return this.balls.length === this.MAX_BALLS;
  }

  public getBalls(): Ball[] {
    return [...this.balls];
  }

  public getOverNumber(): number {
    return this.overNumber;
  }

  public getRunsInOver(): number {
    return this.balls.reduce((sum, ball) => sum + ball.getBallResultRuns(), 0);
  }

  public getWicketsInOver(): number {
    return this.balls.filter((ball) => ball.getIsWicket()).length;
  }
}

// Add Innings State classes
class InningsInProgressState implements IInningsState {
  public canAddBall(): boolean {
    return true;
  }

  public handleBall(innings: Innings, ball: Ball): boolean {
    return innings.addBall(ball);
  }
}

class InningsCompletedState implements IInningsState {
  public canAddBall(): boolean {
    return false;
  }

  public handleBall(innings: Innings, ball: Ball): boolean {
    return false;
  }
}

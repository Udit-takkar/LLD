// Enums
enum BillItemType {
  BASE_CHARGE = "BASE_CHARGE",
  ADDITIONAL_SERVICE = "ADDITIONAL_SERVICE",
  FINE = "FINE",
  DAMAGE_CHARGE = "DAMAGE_CHARGE",
  OTHER = "OTHER",
}

enum VehicleLogType {
  ACCIDENT = "ACCIDENT",
  FUELING = "FUELING",
  CLEANING_SERVICE = "CLEANING_SERVICE",
  OIL_CHANGE = "OIL_CHANGE",
  REPAIR = "REPAIR",
  INSPECTION = "INSPECTION",
  OTHER = "OTHER",
}

enum VanType {
  PASSENGER = "PASSENGER",
  CARGO = "CARGO",
}

enum CarType {
  ECONOMY = "ECONOMY",
  COMPACT = "COMPACT",
  INTERMEDIATE = "INTERMEDIATE",
  STANDARD = "STANDARD",
  FULL_SIZE = "FULL_SIZE",
  PREMIUM = "PREMIUM",
  LUXURY = "LUXURY",
  SPORTS = "SPORTS",
}

enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  LOANED = "LOANED",
  LOST = "LOST",
  BEING_SERVICED = "BEING_SERVICED",
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER",
}

enum ReservationStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  NONE = "NONE",
  EXPIRED = "EXPIRED",
}

enum AccountStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
  BLACKLISTED = "BLACKLISTED",
  BLOCKED = "BLOCKED",
  UNDER_REVIEW = "UNDER_REVIEW",
}

enum PaymentStatus {
  UNPAID = "UNPAID",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  DECLINED = "DECLINED",
  CANCELED = "CANCELED",
  ABANDONED = "ABANDONED",
  SETTLING = "SETTLING",
  SETTLED = "SETTLED",
  REFUNDED = "REFUNDED",
}

// Basic interfaces
interface Observer {
  update(message: string): void;
}

interface Command {
  execute(): void;
}

interface Search {
  searchByType(type: string): Vehicle[];
  searchByModel(model: string): Vehicle[];
}

// Basic classes
class Address {
  constructor(
    private streetAddress: string,
    private city: string,
    private state: string,
    private zipCode: string,
    private country: string
  ) {}

  getFullAddress(): string {
    return `${this.streetAddress}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}

class Person {
  constructor(
    private name: string,
    private address: Address,
    private email: string,
    private phone: string
  ) {}

  getName(): string {
    return this.name;
  }
}

// Account management
abstract class Account {
  constructor(
    private id: string,
    private password: string,
    private status: AccountStatus,
    private person: Person
  ) {}

  resetPassword(): boolean {
    console.log(`Password reset for account: ${this.id}`);
    return true;
  }
}

class Member extends Account {
  private totalVehiclesReserved: number = 0;
  private reservations: VehicleReservation[] = [];

  getReservations(): VehicleReservation[] {
    return this.reservations;
  }
}

class Receptionist extends Account {
  constructor(
    id: string,
    password: string,
    status: AccountStatus,
    person: Person,
    private dateJoined: Date
  ) {
    super(id, password, status, person);
  }

  searchMember(name: string): Member[] {
    console.log(`Searching for member: ${name}`);
    return [];
  }

  reserveVehicle(reservation: VehicleReservation): boolean {
    console.log("Vehicle reserved by receptionist.");
    return true;
  }
}

class RentalWorker extends Account {
  updateVehicleLog(vehicle: Vehicle, log: VehicleLog): boolean {
    vehicle.getLog().push(log);
    console.log("Vehicle log updated.");
    return true;
  }
}

// Vehicle management
abstract class Vehicle {
  private log: VehicleLog[] = [];

  constructor(
    private licenseNumber: string,
    private stockNumber: string,
    private passengerCapacity: number,
    private barcode: string,
    private hasSunroof: boolean,
    private status: VehicleStatus,
    private model: string,
    private make: string,
    private manufacturingYear: number,
    private mileage: number
  ) {}

  reserveVehicle(): boolean {
    this.status = VehicleStatus.RESERVED;
    console.log("Vehicle reserved.");
    return true;
  }

  returnVehicle(): boolean {
    this.status = VehicleStatus.AVAILABLE;
    console.log("Vehicle returned.");
    return true;
  }

  getLog(): VehicleLog[] {
    return this.log;
  }
}

class Car extends Vehicle {
  constructor(
    licenseNumber: string,
    stockNumber: string,
    passengerCapacity: number,
    barcode: string,
    hasSunroof: boolean,
    status: VehicleStatus,
    model: string,
    make: string,
    manufacturingYear: number,
    mileage: number,
    private type: CarType
  ) {
    super(
      licenseNumber,
      stockNumber,
      passengerCapacity,
      barcode,
      hasSunroof,
      status,
      model,
      make,
      manufacturingYear,
      mileage
    );
  }
}

class Van extends Vehicle {
  constructor(
    licenseNumber: string,
    stockNumber: string,
    passengerCapacity: number,
    barcode: string,
    hasSunroof: boolean,
    status: VehicleStatus,
    model: string,
    make: string,
    manufacturingYear: number,
    mileage: number,
    private type: VanType
  ) {
    super(
      licenseNumber,
      stockNumber,
      passengerCapacity,
      barcode,
      hasSunroof,
      status,
      model,
      make,
      manufacturingYear,
      mileage
    );
  }
}

class VehicleLog {
  constructor(
    private id: string,
    private type: VehicleLogType,
    private description: string,
    private creationDate: Date
  ) {}

  update(): boolean {
    console.log("Vehicle log updated.");
    return true;
  }

  searchByLogType(type: VehicleLogType): VehicleLogType[] {
    return [];
  }
}

// Reservation system
class VehicleReservation {
  private additionalDrivers: AdditionalDriver[] = [];
  private notifications: RentalNotification[] = [];
  private insurances: RentalInsurance[] = [];
  private equipments: Equipment[] = [];
  private services: Service[] = [];

  constructor(
    private reservationNumber: string,
    private creationDate: Date,
    private status: ReservationStatus,
    private dueDate: Date,
    private returnDate: Date,
    private pickupLocationName: string,
    private returnLocationName: string,
    private customerID: number,
    private vehicle: Vehicle,
    private bill: Bill
  ) {}

  static fetchReservationDetails(
    reservationNumber: string
  ): VehicleReservation | null {
    console.log(`Fetching reservation details for: ${reservationNumber}`);
    return null;
  }

  getAdditionalDrivers(): AdditionalDriver[] {
    return this.additionalDrivers;
  }

  completeReservation(): boolean {
    this.status = ReservationStatus.COMPLETED;
    console.log("Reservation completed.");
    return true;
  }
}

// Additional components
class AdditionalDriver {
  constructor(private driverID: string, private person: Person) {}
}

class Equipment {
  constructor(private name: string, private cost: number) {}
}

class Service {
  constructor(private name: string, private cost: number) {}
}

class RentalInsurance {
  constructor(
    private name: string,
    private cost: number,
    private coverage: number
  ) {}
}

class Bill {
  constructor(
    private id: string,
    private amount: number,
    private status: PaymentStatus
  ) {}
}

class RentalNotification {
  constructor(
    private id: string,
    private message: string,
    private timestamp: Date
  ) {}
}

// System management
class CarRentalLocation {
  constructor(private name: string, private location: Address) {}

  getLocation(): Address {
    return this.location;
  }
}

class CarRentalSystem {
  constructor(
    private name: string,
    private locations: CarRentalLocation[] = []
  ) {}

  addNewLocation(location: CarRentalLocation): boolean {
    this.locations.push(location);
    console.log(`New location added: ${location.getLocation()}`);
    return true;
  }
}

class VehicleInventory implements Search {
  constructor(
    private vehicleTypes: Map<string, Vehicle[]> = new Map(),
    private vehicleModels: Map<string, Vehicle[]> = new Map()
  ) {}

  searchByType(query: string): Vehicle[] {
    console.log(`Searching vehicles by type: ${query}`);
    return this.vehicleTypes.get(query) || [];
  }

  searchByModel(query: string): Vehicle[] {
    console.log(`Searching vehicles by model: ${query}`);
    return this.vehicleModels.get(query) || [];
  }
}

// Observer pattern implementation
class SystemNotifier {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(message: string): void {
    this.observers.forEach((observer) => observer.update(message));
  }
}

class Customer implements Observer {
  constructor(private name: string, private account: Account) {}

  update(message: string): void {
    console.log(`Notification for ${this.name}: ${message}`);
  }
}

// Command pattern implementation
class ReserveVehicleCommand implements Command {
  constructor(private reservation: VehicleReservation) {}

  execute(): void {
    this.reservation.completeReservation();
  }
}

// Example usage
function main() {
  // Create system notifier and add customers as observers
  const notifier = new SystemNotifier();
  const address = new Address(
    "123 Main St",
    "City",
    "State",
    "12345",
    "Country"
  );
  const person = new Person(
    "John Doe",
    address,
    "john@example.com",
    "123-456-7890"
  );
  const member = new Member("id1", "password", AccountStatus.ACTIVE, person);

  const alice = new Customer("Alice", member);
  const bob = new Customer("Bob", member);

  notifier.addObserver(alice);
  notifier.addObserver(bob);

  // Notify customers
  notifier.notifyObservers("Your vehicle reservation is overdue!");

  // Create and complete a reservation using Command pattern
  const vehicle = new Car(
    "LIC123",
    "STK123",
    5,
    "BAR123",
    true,
    VehicleStatus.AVAILABLE,
    "Model3",
    "Tesla",
    2023,
    0,
    CarType.LUXURY
  );
  const reservation = new VehicleReservation(
    "RES123",
    new Date(),
    ReservationStatus.PENDING,
    new Date(),
    new Date(),
    "Location A",
    "Location B",
    1,
    vehicle,
    new Bill("BILL123", 100, PaymentStatus.PENDING)
  );

  const reserveCommand = new ReserveVehicleCommand(reservation);
  reserveCommand.execute();

  // Search for vehicles
  const inventory = new VehicleInventory();
  inventory.searchByType("SUV");
}

// Run the example
main();

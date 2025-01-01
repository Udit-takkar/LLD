var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Enums and Interfaces
var AutomobileType = {
    SEDAN: "SEDAN",
    SUV: "SUV",
    HATCHBACK: "HATCHBACK",
    COUPE: "COUPE",
    CONVERTIBLE: "CONVERTIBLE",
    WAGON: "WAGON",
};
var ReservationStatus = {
    SCHEDULED: "SCHEDULED",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};
// Base Classes
var Log = /** @class */ (function () {
    function Log(date, action) {
        this.date = date;
        this.action = action;
    }
    Log.prototype.getDate = function () {
        return this.date;
    };
    Log.prototype.getAction = function () {
        return this.action;
    };
    return Log;
}());
var Member = /** @class */ (function () {
    function Member(name, email, phone, id) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.id = id;
        this.balance = 0;
    }
    Member.prototype.getId = function () {
        return this.id;
    };
    Member.prototype.getEmail = function () {
        return this.email;
    };
    Member.prototype.addBalance = function (amount) {
        this.balance += amount;
    };
    Member.prototype.getBalance = function () {
        return this.balance;
    };
    Member.prototype.setAutomobile = function (automobile) {
        this.automobile = automobile;
    };
    Member.prototype.getAutomobile = function () {
        return this.automobile;
    };
    return Member;
}());
var Equipment = /** @class */ (function () {
    function Equipment(name, dailyRate) {
        this.name = name;
        this.dailyRate = dailyRate;
    }
    Equipment.prototype.getName = function () {
        return this.name;
    };
    Equipment.prototype.getDailyRate = function () {
        return this.dailyRate;
    };
    return Equipment;
}());
var Insurance = /** @class */ (function () {
    function Insurance(type, dailyRate, coverage) {
        this.type = type;
        this.dailyRate = dailyRate;
        this.coverage = coverage;
    }
    Insurance.prototype.getType = function () {
        return this.type;
    };
    Insurance.prototype.getDailyRate = function () {
        return this.dailyRate;
    };
    Insurance.prototype.getCoverage = function () {
        return this.coverage;
    };
    return Insurance;
}());
// Abstract Vehicle Class
var Vehicle = /** @class */ (function () {
    function Vehicle(barCode, isAvailable, parkingLotNumber) {
        if (isAvailable === void 0) { isAvailable = true; }
        this.barCode = barCode;
        this.isAvailable = isAvailable;
        this.parkingLotNumber = parkingLotNumber;
        this.logs = [];
    }
    Vehicle.prototype.addLog = function (log) {
        this.logs.push(log);
    };
    Vehicle.prototype.getBarCode = function () {
        return this.barCode;
    };
    Vehicle.prototype.isVehicleAvailable = function () {
        return this.isAvailable;
    };
    Vehicle.prototype.setParkingLot = function (number) {
        this.parkingLotNumber = number;
        this.addLog(new Log(new Date(), "Moved to parking lot ".concat(number)));
    };
    return Vehicle;
}());
// Automobile Class
var Automobile = /** @class */ (function (_super) {
    __extends(Automobile, _super);
    function Automobile(type, barCode, parkingLotNumber) {
        var _this = _super.call(this, barCode, true, parkingLotNumber) || this;
        _this.type = type;
        _this.equipment = [];
        _this.baseRates = new Map([
            [AutomobileType.SEDAN, 50],
            [AutomobileType.SUV, 80],
            [AutomobileType.HATCHBACK, 45],
            [AutomobileType.COUPE, 60],
            [AutomobileType.CONVERTIBLE, 85],
            [AutomobileType.WAGON, 55],
        ]);
        return _this;
    }
    Automobile.prototype.getType = function () {
        return this.type;
    };
    Automobile.prototype.calculateRentalPrice = function () {
        var basePrice = this.baseRates.get(this.type) || 50;
        var equipmentCharges = this.equipment.reduce(function (sum, eq) { return sum + eq.getDailyRate(); }, 0);
        return basePrice + equipmentCharges;
    };
    Automobile.prototype.addEquipment = function (equipment) {
        this.equipment.push(equipment);
        this.addLog(new Log(new Date(), "Added equipment: ".concat(equipment.getName())));
    };
    Automobile.prototype.setReservation = function (reservation) {
        this.currentReservation = reservation;
        this.isAvailable = false;
    };
    Automobile.prototype.completeReservation = function () {
        this.currentReservation = undefined;
        this.isAvailable = true;
    };
    return Automobile;
}(Vehicle));
// Reservation Class
var Reservation = /** @class */ (function () {
    function Reservation(vehicle, member, startDate, endDate) {
        this.vehicle = vehicle;
        this.member = member;
        this.startDate = startDate;
        this.endDate = endDate;
        this.equipment = [];
        this.id = Math.random().toString(36).substr(2, 9);
        this.status = ReservationStatus.SCHEDULED;
        this.additionalServices = new Map();
    }
    Reservation.prototype.getId = function () {
        return this.id;
    };
    Reservation.prototype.getMember = function () {
        return this.member;
    };
    Reservation.prototype.getStartDate = function () {
        return this.startDate;
    };
    Reservation.prototype.getEndDate = function () {
        return this.endDate;
    };
    Reservation.prototype.addEquipment = function (equipment) {
        this.equipment.push(equipment);
    };
    Reservation.prototype.addInsurance = function (insurance) {
        this.insurance = insurance;
    };
    Reservation.prototype.addService = function (serviceName, price) {
        this.additionalServices.set(serviceName, price);
    };
    Reservation.prototype.calculateTotalCost = function () {
        var rentalDays = Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 24));
        var totalCost = this.vehicle.calculateRentalPrice() * rentalDays;
        this.equipment.forEach(function (eq) {
            totalCost += eq.getDailyRate() * rentalDays;
        });
        if (this.insurance) {
            totalCost += this.insurance.getDailyRate() * rentalDays;
        }
        this.additionalServices.forEach(function (price) {
            totalCost += price;
        });
        return totalCost;
    };
    Reservation.prototype.cancel = function () {
        this.status = ReservationStatus.CANCELLED;
    };
    return Reservation;
}());
// Reservation Service
var ReservationService = /** @class */ (function () {
    function ReservationService(notifications) {
        this.notifications = notifications;
        this.reservations = new Map();
    }
    ReservationService.prototype.makeReservation = function (vehicle, member, startDate, endDate) {
        if (!vehicle.isVehicleAvailable()) {
            throw new Error("Vehicle is not available");
        }
        if (startDate >= endDate) {
            throw new Error("Invalid date range");
        }
        var reservation = new Reservation(vehicle, member, startDate, endDate);
        this.reservations.set(reservation.getId(), reservation);
        this.scheduleNotifications(reservation);
        return reservation;
    };
    ReservationService.prototype.cancelReservation = function (reservationId) {
        var reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error("Reservation not found");
        }
        reservation.cancel();
        this.reservations.delete(reservationId);
    };
    ReservationService.prototype.scheduleNotifications = function (reservation) {
        var _this = this;
        setTimeout(function () {
            _this.notifications.sendPickupReminder(reservation.getMember(), reservation);
        }, this.getMillisecondsUntil(reservation.getStartDate(), -24));
        setTimeout(function () {
            _this.notifications.sendReturnReminder(reservation.getMember(), reservation);
        }, this.getMillisecondsUntil(reservation.getEndDate(), -4));
    };
    ReservationService.prototype.getMillisecondsUntil = function (date, hourOffset) {
        if (hourOffset === void 0) { hourOffset = 0; }
        var now = new Date();
        var target = new Date(date.getTime());
        target.setHours(target.getHours() + hourOffset);
        return target.getTime() - now.getTime();
    };
    return ReservationService;
}());
// Main CarRental System Class
var CarRental = /** @class */ (function () {
    function CarRental(notificationService) {
        this.notificationService = notificationService;
        this.vehicles = new Map();
        this.members = new Map();
        this.reservationService = new ReservationService(notificationService);
    }
    CarRental.prototype.addVehicle = function (vehicle) {
        this.vehicles.set(vehicle.getBarCode(), vehicle);
    };
    CarRental.prototype.registerMember = function (member) {
        this.members.set(member.getId(), member);
    };
    CarRental.prototype.searchVehicles = function (type) {
        return Array.from(this.vehicles.values()).filter(function (vehicle) {
            if (!vehicle.isVehicleAvailable())
                return false;
            if (type && vehicle instanceof Automobile) {
                return vehicle.getType() === type;
            }
            return true;
        });
    };
    CarRental.prototype.makeReservation = function (vehicleBarCode, memberId, startDate, endDate) {
        var vehicle = this.vehicles.get(vehicleBarCode);
        var member = this.members.get(memberId);
        if (!vehicle || !member) {
            throw new Error("Vehicle or member not found");
        }
        return this.reservationService.makeReservation(vehicle, member, startDate, endDate);
    };
    CarRental.prototype.returnVehicle = function (vehicleBarCode) {
        var vehicle = this.vehicles.get(vehicleBarCode);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        if (vehicle instanceof Automobile) {
            vehicle.completeReservation();
        }
    };
    return CarRental;
}());
// Example Email Notification Service Implementation
var EmailNotificationService = /** @class */ (function () {
    function EmailNotificationService() {
    }
    EmailNotificationService.prototype.sendPickupReminder = function (member, reservation) {
        console.log("Sending pickup reminder to ".concat(member.getEmail(), " for reservation ").concat(reservation.getId()));
    };
    EmailNotificationService.prototype.sendReturnReminder = function (member, reservation) {
        console.log("Sending return reminder to ".concat(member.getEmail(), " for reservation ").concat(reservation.getId()));
    };
    EmailNotificationService.prototype.sendOverdueNotice = function (member, reservation) {
        console.log("Sending overdue notice to ".concat(member.getEmail(), " for reservation ").concat(reservation.getId()));
    };
    return EmailNotificationService;
}());
// Example Usage
var notificationService = new EmailNotificationService();
var carRental = new CarRental(notificationService);
// Add vehicles
var sedan = new Automobile(AutomobileType.SEDAN, "BAR123", 1);
carRental.addVehicle(sedan);
// Register member
var member = new Member("John Doe", "john@example.com", "123-456-7890", "MEM001");
carRental.registerMember(member);
// Make reservation
var reservation = carRental.makeReservation("BAR123", "MEM001", new Date("2024-03-20"), new Date("2024-03-25"));
// Add equipment
var gps = new Equipment("GPS", 10);
reservation.addEquipment(gps);
// Add insurance
var insurance = new Insurance("Full Coverage", 20, 50000);
reservation.addInsurance(insurance);
// Calculate total cost
console.log("Total reservation cost: $".concat(reservation.calculateTotalCost()));

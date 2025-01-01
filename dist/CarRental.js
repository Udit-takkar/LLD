"use strict";
// Enums and Interfaces
const AutomobileType = {
    SEDAN: "SEDAN",
    SUV: "SUV",
    HATCHBACK: "HATCHBACK",
    COUPE: "COUPE",
    CONVERTIBLE: "CONVERTIBLE",
    WAGON: "WAGON",
};
const ReservationStatus = {
    SCHEDULED: "SCHEDULED",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};
// Base Classes
class Log {
    constructor(date, action) {
        this.date = date;
        this.action = action;
    }
    getDate() {
        return this.date;
    }
    getAction() {
        return this.action;
    }
}
class Member {
    constructor(name, email, phone, id) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.id = id;
        this.balance = 0;
    }
    getId() {
        return this.id;
    }
    getEmail() {
        return this.email;
    }
    addBalance(amount) {
        this.balance += amount;
    }
    getBalance() {
        return this.balance;
    }
    setAutomobile(automobile) {
        this.automobile = automobile;
    }
    getAutomobile() {
        return this.automobile;
    }
}
class Equipment {
    constructor(name, dailyRate) {
        this.name = name;
        this.dailyRate = dailyRate;
    }
    getName() {
        return this.name;
    }
    getDailyRate() {
        return this.dailyRate;
    }
}
class Insurance {
    constructor(type, dailyRate, coverage) {
        this.type = type;
        this.dailyRate = dailyRate;
        this.coverage = coverage;
    }
    getType() {
        return this.type;
    }
    getDailyRate() {
        return this.dailyRate;
    }
    getCoverage() {
        return this.coverage;
    }
}
// Abstract Vehicle Class
class Vehicle {
    constructor(barCode, isAvailable = true, parkingLotNumber) {
        this.barCode = barCode;
        this.isAvailable = isAvailable;
        this.parkingLotNumber = parkingLotNumber;
        this.logs = [];
    }
    addLog(log) {
        this.logs.push(log);
    }
    getBarCode() {
        return this.barCode;
    }
    isVehicleAvailable() {
        return this.isAvailable;
    }
    setParkingLot(number) {
        this.parkingLotNumber = number;
        this.addLog(new Log(new Date(), `Moved to parking lot ${number}`));
    }
}
// Automobile Class
class Automobile extends Vehicle {
    constructor(type, barCode, parkingLotNumber) {
        super(barCode, true, parkingLotNumber);
        this.type = type;
        this.equipment = [];
        this.baseRates = new Map([
            [AutomobileType.SEDAN, 50],
            [AutomobileType.SUV, 80],
            [AutomobileType.HATCHBACK, 45],
            [AutomobileType.COUPE, 60],
            [AutomobileType.CONVERTIBLE, 85],
            [AutomobileType.WAGON, 55],
        ]);
    }
    getType() {
        return this.type;
    }
    calculateRentalPrice() {
        const basePrice = this.baseRates.get(this.type) || 50;
        const equipmentCharges = this.equipment.reduce((sum, eq) => sum + eq.getDailyRate(), 0);
        return basePrice + equipmentCharges;
    }
    addEquipment(equipment) {
        this.equipment.push(equipment);
        this.addLog(new Log(new Date(), `Added equipment: ${equipment.getName()}`));
    }
    setReservation(reservation) {
        this.currentReservation = reservation;
        this.isAvailable = false;
    }
    completeReservation() {
        this.currentReservation = undefined;
        this.isAvailable = true;
    }
}
// Reservation Class
class Reservation {
    constructor(vehicle, member, startDate, endDate) {
        this.vehicle = vehicle;
        this.member = member;
        this.startDate = startDate;
        this.endDate = endDate;
        this.equipment = [];
        this.id = Math.random().toString(36).substr(2, 9);
        this.status = ReservationStatus.SCHEDULED;
        this.additionalServices = new Map();
    }
    getId() {
        return this.id;
    }
    getMember() {
        return this.member;
    }
    getStartDate() {
        return this.startDate;
    }
    getEndDate() {
        return this.endDate;
    }
    addEquipment(equipment) {
        this.equipment.push(equipment);
    }
    addInsurance(insurance) {
        this.insurance = insurance;
    }
    addService(serviceName, price) {
        this.additionalServices.set(serviceName, price);
    }
    calculateTotalCost() {
        const rentalDays = Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 24));
        let totalCost = this.vehicle.calculateRentalPrice() * rentalDays;
        this.equipment.forEach((eq) => {
            totalCost += eq.getDailyRate() * rentalDays;
        });
        if (this.insurance) {
            totalCost += this.insurance.getDailyRate() * rentalDays;
        }
        this.additionalServices.forEach((price) => {
            totalCost += price;
        });
        return totalCost;
    }
    cancel() {
        this.status = ReservationStatus.CANCELLED;
    }
}
// Reservation Service
class ReservationService {
    constructor(notifications) {
        this.notifications = notifications;
        this.reservations = new Map();
    }
    makeReservation(vehicle, member, startDate, endDate) {
        if (!vehicle.isVehicleAvailable()) {
            throw new Error("Vehicle is not available");
        }
        if (startDate >= endDate) {
            throw new Error("Invalid date range");
        }
        const reservation = new Reservation(vehicle, member, startDate, endDate);
        this.reservations.set(reservation.getId(), reservation);
        this.scheduleNotifications(reservation);
        return reservation;
    }
    cancelReservation(reservationId) {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error("Reservation not found");
        }
        reservation.cancel();
        this.reservations.delete(reservationId);
    }
    scheduleNotifications(reservation) {
        setTimeout(() => {
            this.notifications.sendPickupReminder(reservation.getMember(), reservation);
        }, this.getMillisecondsUntil(reservation.getStartDate(), -24));
        setTimeout(() => {
            this.notifications.sendReturnReminder(reservation.getMember(), reservation);
        }, this.getMillisecondsUntil(reservation.getEndDate(), -4));
    }
    getMillisecondsUntil(date, hourOffset = 0) {
        const now = new Date();
        const target = new Date(date.getTime());
        target.setHours(target.getHours() + hourOffset);
        return target.getTime() - now.getTime();
    }
}
// Main CarRental System Class
class CarRental {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.vehicles = new Map();
        this.members = new Map();
        this.reservationService = new ReservationService(notificationService);
    }
    addVehicle(vehicle) {
        this.vehicles.set(vehicle.getBarCode(), vehicle);
    }
    registerMember(member) {
        this.members.set(member.getId(), member);
    }
    searchVehicles(type) {
        return Array.from(this.vehicles.values()).filter((vehicle) => {
            if (!vehicle.isVehicleAvailable())
                return false;
            if (type && vehicle instanceof Automobile) {
                return vehicle.getType() === type;
            }
            return true;
        });
    }
    makeReservation(vehicleBarCode, memberId, startDate, endDate) {
        const vehicle = this.vehicles.get(vehicleBarCode);
        const member = this.members.get(memberId);
        if (!vehicle || !member) {
            throw new Error("Vehicle or member not found");
        }
        return this.reservationService.makeReservation(vehicle, member, startDate, endDate);
    }
    returnVehicle(vehicleBarCode) {
        const vehicle = this.vehicles.get(vehicleBarCode);
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        if (vehicle instanceof Automobile) {
            vehicle.completeReservation();
        }
    }
}
// Example Email Notification Service Implementation
class EmailNotificationService {
    sendPickupReminder(member, reservation) {
        console.log(`Sending pickup reminder to ${member.getEmail()} for reservation ${reservation.getId()}`);
    }
    sendReturnReminder(member, reservation) {
        console.log(`Sending return reminder to ${member.getEmail()} for reservation ${reservation.getId()}`);
    }
    sendOverdueNotice(member, reservation) {
        console.log(`Sending overdue notice to ${member.getEmail()} for reservation ${reservation.getId()}`);
    }
}
// Example Usage
const notificationService = new EmailNotificationService();
const carRental = new CarRental(notificationService);
// Add vehicles
const sedan = new Automobile(AutomobileType.SEDAN, "BAR123", 1);
carRental.addVehicle(sedan);
// Register member
const member = new Member("John Doe", "john@example.com", "123-456-7890", "MEM001");
carRental.registerMember(member);
// Make reservation
const reservation = carRental.makeReservation("BAR123", "MEM001", new Date("2024-03-20"), new Date("2024-03-25"));
// Add equipment
const gps = new Equipment("GPS", 10);
reservation.addEquipment(gps);
// Add insurance
const insurance = new Insurance("Full Coverage", 20, 50000);
reservation.addInsurance(insurance);
// Calculate total cost
console.log(`Total reservation cost: $${reservation.calculateTotalCost()}`);

// Enums
enum BookFormat {
  Hardcover,
  Paperback,
  Audiobook,
  Ebook,
  Newspaper,
  Magazine,
  Journal,
}

enum BookStatus {
  AVAILABLE,
  RESERVED,
  LOANED,
  LOST,
}

enum ReservationStatus {
  Waiting,
  Pending,
  Completed,
  Cancelled,
  None,
}

enum AccountStatus {
  Active,
  Closed,
  Cancelled,
  Blacklisted,
  None,
}

// Interfaces
interface Address {
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

interface Person {
  name: string;
  address: Address;
  email: string;
  phone: string;
}

interface Search {
  searchByTitle(title: string): BookItem[];
  searchByAuthor(author: string): BookItem[];
  searchBySubject(subject: string): BookItem[];
  searchByPubDate(publishDate: Date): BookItem[];
}

// Book related classes
class Author {
  constructor(private name: string, private description: string) {}

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }
}

class Book {
  constructor(
    protected ISBN: string,
    protected title: string,
    protected subject: string,
    protected publisher: string,
    protected language: string,
    protected numberOfPages: number,
    protected author: Author
  ) {}

  getTitle(): string {
    return this.title;
  }

  getAuthor(): Author {
    return this.author;
  }

  getISBN(): string {
    return this.ISBN;
  }

  getSubject(): string {
    return this.subject;
  }
}

class BookItem extends Book {
  private borrowed: Date | null = null;
  private dueDate: Date | null = null;
  private borrower: Member | null = null;
  private reservedBy: Member | null = null;

  constructor(
    ISBN: string,
    title: string,
    subject: string,
    publisher: string,
    language: string,
    numberOfPages: number,
    author: Author,
    public readonly barcode: string,
    private isReferenceOnly: boolean,
    private price: number,
    private format: BookFormat,
    private status: BookStatus,
    private dateOfPurchase: Date,
    private publicationDate: Date,
    private placedAt: Rack
  ) {
    super(ISBN, title, subject, publisher, language, numberOfPages, author);
  }

  checkout(member: Member): boolean {
    if (this.isReferenceOnly || this.status !== BookStatus.AVAILABLE) {
      return false;
    }

    this.borrower = member;
    this.status = BookStatus.LOANED;
    this.borrowed = new Date();
    this.dueDate = new Date();
    this.dueDate.setDate(this.dueDate.getDate() + 14); // 14 days lending period
    return true;
  }

  returnBook(): boolean {
    if (this.status !== BookStatus.LOANED) {
      return false;
    }

    if (this.isOverdue() && this.borrower && this.dueDate) {
      const fineAmount = this.calculateFine();
      const fine = new Fine(fineAmount, this.borrower, this, this.dueDate);
      this.borrower.library.getFineManagement().addFine(this.borrower.id, fine);
      this.borrower.addFine(fineAmount);
    }

    this.status = BookStatus.AVAILABLE;
    this.borrower = null;
    this.borrowed = null;
    this.dueDate = null;
    return true;
  }

  reserve(member: Member): boolean {
    if (this.status !== BookStatus.AVAILABLE) {
      return false;
    }

    this.status = BookStatus.RESERVED;
    this.reservedBy = member;
    return true;
  }

  cancelReservation(member: Member): boolean {
    if (this.status !== BookStatus.RESERVED || this.reservedBy !== member) {
      return false;
    }

    this.status = BookStatus.AVAILABLE;
    this.reservedBy = null;
    return true;
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
  }

  calculateFine(): number {
    if (!this.dueDate || !this.isOverdue()) return 0;

    const daysOverdue = Math.floor(
      (new Date().getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysOverdue * 1.5; // $1.50 per day
  }

  getStatus(): BookStatus {
    return this.status;
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  getBorrower(): Member | null {
    return this.borrower;
  }
}

// Library organization
class Rack {
  private books: BookItem[] = [];

  constructor(private number: number, private locationIdentifier: string) {}

  addBook(book: BookItem): void {
    this.books.push(book);
  }

  removeBook(book: BookItem): void {
    this.books = this.books.filter((b) => b !== book);
  }

  getBooks(): BookItem[] {
    return [...this.books];
  }
}

class Catalog implements Search {
  private bookTitles: Map<string, BookItem[]> = new Map();
  private bookAuthors: Map<string, BookItem[]> = new Map();
  private bookSubjects: Map<string, BookItem[]> = new Map();
  private bookPublicationDates: Map<string, BookItem[]> = new Map();

  constructor(private creationDate: Date, private totalBooks: number = 0) {}

  addBook(bookItem: Book): void {
    this.addToMap(this.bookTitles, bookItem.getTitle(), bookItem);
    this.addToMap(this.bookAuthors, bookItem.getAuthor().getName(), bookItem);
    this.addToMap(this.bookSubjects, bookItem.getSubject(), bookItem);
    this.totalBooks++;
  }

  private addToMap(map: Map<string, BookItem[]>, key: string, book: any): void {
    const books = map.get(key) || [];
    books.push(book);
    map.set(key, books);
  }

  searchByTitle(title: string): BookItem[] {
    return this.bookTitles.get(title) || [];
  }

  searchByAuthor(authorName: string): BookItem[] {
    return this.bookAuthors.get(authorName) || [];
  }

  searchBySubject(subject: string): BookItem[] {
    return this.bookSubjects.get(subject) || [];
  }

  searchByPubDate(publishDate: Date): BookItem[] {
    const dateStr = publishDate.toISOString().split("T")[0];
    return this.bookPublicationDates.get(dateStr) || [];
  }

  updateCatalog(): boolean {
    return true;
  }
}

// Account management
abstract class Account {
  constructor(
    protected id: string,
    protected password: string,
    protected status: AccountStatus,
    protected person: Person
  ) {}

  resetPassword(oldPassword: string, newPassword: string): boolean {
    if (this.password === oldPassword) {
      this.password = newPassword;
      return true;
    }
    return false;
  }

  getStatus(): AccountStatus {
    return this.status;
  }
}

class Librarian extends Account {
  constructor(
    id: string,
    password: string,
    person: Person,
    private library: Library
  ) {
    super(id, password, AccountStatus.Active, person);
  }

  addBookItem(bookItem: BookItem): boolean {
    return this.library.addBookItem(bookItem);
  }

  blockMember(member: Member): boolean {
    member.status = AccountStatus.Blacklisted;
    return true;
  }

  unblockMember(member: Member): boolean {
    member.status = AccountStatus.Active;
    return true;
  }

  issueBook(bookItem: BookItem, member: Member): boolean {
    if (member.getStatus() !== AccountStatus.Active) {
      return false;
    }
    return bookItem.checkout(member);
  }

  returnBook(bookItem: BookItem): boolean {
    return bookItem.returnBook();
  }

  collectFine(
    member: Member,
    fine: Fine,
    amount: number,
    paymentMethod: "CREDIT_CARD" | "CASH" | "CHECK",
    paymentDetails: any
  ): boolean {
    return member.payFine(fine, amount, paymentMethod, paymentDetails);
  }
}

class Member extends Account {
  private dateOfMembership: Date;
  private totalBooksCheckedout: number = 0;
  public fineBalance: number = 0;

  constructor(
    id: string,
    password: string,
    person: Person,
    dateOfMembership: Date,
    public readonly library: Library
  ) {
    super(id, password, AccountStatus.Active, person);
    this.dateOfMembership = dateOfMembership;
  }

  getTotalCheckedoutBooks(): number {
    return this.totalBooksCheckedout;
  }

  addFine(amount: number): void {
    this.fineBalance += amount;
  }

  payFine(
    fine: Fine,
    amount: number,
    paymentMethod: "CREDIT_CARD" | "CASH" | "CHECK",
    paymentDetails: any
  ): boolean {
    return this.library.processFinePayment(
      this,
      fine,
      amount,
      paymentMethod,
      paymentDetails
    );
  }

  getFines(): Fine[] {
    return this.library.getFineManagement().getMemberFines(this.id);
  }

  getUnpaidFines(): Fine[] {
    return this.library.getFineManagement().getUnpaidFines(this.id);
  }
}

// Library Management
class Library {
  private catalog: Catalog;
  private members: Map<string, Member>;
  private books: Map<string, BookItem>;
  private librarians: Map<string, Librarian>;
  private fineManagement: FineManagement;

  constructor() {
    this.catalog = new Catalog(new Date());
    this.members = new Map();
    this.books = new Map();
    this.librarians = new Map();
    this.fineManagement = new FineManagement();
  }

  addMember(person: Person, password: string): Member {
    const member = new Member(
      this.generateMemberId(),
      password,
      person,
      new Date(),
      this
    );
    this.members.set(member.id, member);
    return member;
  }

  private generateMemberId(): string {
    return `M${this.members.size + 1}`;
  }

  addLibrarian(librarian: Librarian): void {
    this.librarians.set(librarian.id, librarian);
  }

  addBookItem(bookItem: BookItem): boolean {
    this.books.set(bookItem.barcode, bookItem);
    this.catalog.addBook(bookItem);
    return true;
  }

  removeBookItem(barcode: string): boolean {
    return this.books.delete(barcode);
  }

  searchBooksByTitle(title: string): BookItem[] {
    return this.catalog.searchByTitle(title);
  }

  searchBooksByAuthor(author: string): BookItem[] {
    return this.catalog.searchByAuthor(author);
  }

  searchBooksBySubject(subject: string): BookItem[] {
    return this.catalog.searchBySubject(subject);
  }

  getFineManagement(): FineManagement {
    return this.fineManagement;
  }

  processFinePayment(
    member: Member,
    fine: Fine,
    amount: number,
    paymentMethod: "CREDIT_CARD" | "CASH" | "CHECK",
    paymentDetails: any
  ): boolean {
    if (
      this.fineManagement.processPayment(
        fine,
        amount,
        paymentMethod,
        paymentDetails
      )
    ) {
      member.fineBalance -= amount;
      return true;
    }
    return false;
  }
}

// Fine management
class Fine {
  constructor(
    private amount: number,
    private member: Member,
    private book: BookItem,
    private dueDate: Date,
    private paymentDate: Date | null = null
  ) {}

  getAmount(): number {
    return this.amount;
  }

  setPaymentDate(date: Date): void {
    this.paymentDate = date;
  }

  isPaid(): boolean {
    return this.paymentDate !== null;
  }
}

abstract class FineTransaction {
  constructor(
    protected creationDate: Date,
    protected amount: number,
    protected fine: Fine,
    protected status: "PENDING" | "COMPLETED" | "FAILED" = "PENDING"
  ) {}

  abstract initiateTransaction(): boolean;

  getStatus(): string {
    return this.status;
  }

  setStatus(status: "PENDING" | "COMPLETED" | "FAILED"): void {
    this.status = status;
  }
}

class CreditCardTransaction extends FineTransaction {
  constructor(
    creationDate: Date,
    amount: number,
    fine: Fine,
    private nameOnCard: string,
    private cardNumber: string,
    private expiryDate: string,
    private cvv: string
  ) {
    super(creationDate, amount, fine);
  }

  initiateTransaction(): boolean {
    // Implementation for credit card transaction
    // In real implementation, this would integrate with a payment gateway
    try {
      // Simulate payment processing
      this.status = "COMPLETED";
      this.fine.setPaymentDate(new Date());
      return true;
    } catch (error) {
      this.status = "FAILED";
      return false;
    }
  }
}

class CashTransaction extends FineTransaction {
  constructor(
    creationDate: Date,
    amount: number,
    fine: Fine,
    private cashTendered: number
  ) {
    super(creationDate, amount, fine);
  }

  initiateTransaction(): boolean {
    if (this.cashTendered < this.amount) {
      this.status = "FAILED";
      return false;
    }

    this.status = "COMPLETED";
    this.fine.setPaymentDate(new Date());
    return true;
  }

  getChange(): number {
    return this.cashTendered - this.amount;
  }
}

class CheckTransaction extends FineTransaction {
  constructor(
    creationDate: Date,
    amount: number,
    fine: Fine,
    private bankName: string,
    private checkNumber: string
  ) {
    super(creationDate, amount, fine);
  }

  initiateTransaction(): boolean {
    // Implementation for check transaction
    try {
      // Simulate check processing
      this.status = "COMPLETED";
      this.fine.setPaymentDate(new Date());
      return true;
    } catch (error) {
      this.status = "FAILED";
      return false;
    }
  }
}

class FineManagement {
  private fines: Map<string, Fine[]> = new Map();
  private transactions: FineTransaction[] = [];

  addFine(memberId: string, fine: Fine): void {
    const memberFines = this.fines.get(memberId) || [];
    memberFines.push(fine);
    this.fines.set(memberId, memberFines);
  }

  getMemberFines(memberId: string): Fine[] {
    return this.fines.get(memberId) || [];
  }

  getUnpaidFines(memberId: string): Fine[] {
    return this.getMemberFines(memberId).filter((fine) => !fine.isPaid());
  }

  processPayment(
    fine: Fine,
    amount: number,
    paymentMethod: "CREDIT_CARD" | "CASH" | "CHECK",
    paymentDetails: any
  ): boolean {
    let transaction: FineTransaction;

    switch (paymentMethod) {
      case "CREDIT_CARD":
        transaction = new CreditCardTransaction(
          new Date(),
          amount,
          fine,
          paymentDetails.nameOnCard,
          paymentDetails.cardNumber,
          paymentDetails.expiryDate,
          paymentDetails.cvv
        );
        break;
      case "CASH":
        transaction = new CashTransaction(
          new Date(),
          amount,
          fine,
          paymentDetails.cashTendered
        );
        break;
      case "CHECK":
        transaction = new CheckTransaction(
          new Date(),
          amount,
          fine,
          paymentDetails.bankName,
          paymentDetails.checkNumber
        );
        break;
    }

    if (transaction.initiateTransaction()) {
      this.transactions.push(transaction);
      return true;
    }
    return false;
  }
}

export {
  BookFormat,
  BookStatus,
  ReservationStatus,
  AccountStatus,
  Address,
  Person,
  Search,
  Author,
  Book,
  BookItem,
  Rack,
  Catalog,
  Account,
  Librarian,
  Member,
  Library,
  Fine,
  FineTransaction,
  CreditCardTransaction,
  CashTransaction,
  CheckTransaction,
};

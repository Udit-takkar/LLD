// Library Management System

// 1. Any library member should be able to search books by their title, author,
// subject category as well by the publication date.
// 2. Each book will have a unique identification number and other details
// including a rack number which will help to physically locate the book.
// 3. There could be more than one copy of a book, and library members
// should be able to check-out and reserve any copy. We will call each copy
// of a book, a book item.
// 4. The system should be able to retrieve information like who took a
// particular book or what are the books checked-out by a specific library
// member.
// 5. There should be a maximum limit (5) on how many books a member can
// check-out.
// 6. There should be a maximum limit (10) on how many days a member can
// keep a book.
// 7. The system should be able to collect fines for books returned after the
// due date.
// 8. Members should be able to reserve books that are not currently available.
// 9. The system should be able to send notifications whenever the reserved
// books become available, as well as when the book is not returned within
// the due date.
// 10. Each book and member card will have a unique barcode. The system will
// be able to read barcodes from books and members’ library cards.

class User {
  public id: string;
  private name: string;
  private email: string;
  private phone: string;

  constructor(id: string, name: string, email: string, phone: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}

class LibraryManagementService {
  private members: LibraryMember[];
  private idToBooks: Map<string, Book[]>;

  constructor() {
    this.members = [];
    this.idToBooks = new Map();
  }

  public addBook(book: Book): void {
    this.idToBooks.set(book.id, [...(this.idToBooks.get(book.id) || []), book]);
  }

  public removeBook(book: Book): void {
    this.idToBooks.delete(book.id);
  }

  public issueBook(book: Book, member: LibraryMember): void {
    if (book.issuedTo) {
      throw new Error("Book is already issued");
    }

    if (book.isReserved()) {
      throw new Error("Book is reserved");
    }

    book.setIssuedTo(member);
  }

  public returnBook(book: Book, member: LibraryMember): void {
    if (book.issuedTo !== member) {
      throw new Error("Book is not issued to this member");
    }

    if (book.isOverdue()) {
      member.balance += book.getOverdueFine();
    }

    book.setIssuedTo(null);
  }

  public reserveBook(book: Book, member: LibraryMember): void {
    if (book.isReserved()) {
      throw new Error("Book is already reserved");
    }

    book.setReservedTo(member);
  }

  public cancelReservation(book: Book, member: LibraryMember): void {
    book.setReservedTo(null);
  }

  //   this can be improved by creating another class for search and support other search criteria
  public searchBookByTitle(title: string): Book[] {
    const allBooks = Array.from(this.idToBooks.values()).flat();
    return allBooks.filter((book) => book.title === title);
  }

  public cancelMembership(member: LibraryMember): void {
    this.members = this.members.filter((m) => m.id !== member.id);
  }
}

class Librarian extends User {
  private libraryManagementService: LibraryManagementService;

  constructor(
    id: string,
    name: string,
    email: string,
    phone: string,
    libraryManagementService: LibraryManagementService
  ) {
    super(id, name, email, phone);
    this.libraryManagementService = libraryManagementService;
  }

  private cancelMembership(member: LibraryMember) {
    this.libraryManagementService.cancelMembership(member);
  }

  public addBook(book: Book) {
    this.libraryManagementService.addBook(book);
  }

  public removeBook(book: Book) {
    this.libraryManagementService.removeBook(book);
  }

  public issueBook(book: Book, member: LibraryMember) {
    this.libraryManagementService.issueBook(book, member);
  }

  public returnBook(book: Book, member: LibraryMember) {
    this.libraryManagementService.returnBook(book, member);
  }

  public reserveBook(book: Book, member: LibraryMember) {
    this.libraryManagementService.reserveBook(book, member);
  }

  public cancelReservation(book: Book, member: LibraryMember) {
    this.libraryManagementService.cancelReservation(book, member);
  }

  public searchBookByTitle(searchTerm: string) {
    return this.libraryManagementService.searchBookByTitle(searchTerm);
  }
}

class LibraryMember extends User {
  public balance: number;
  constructor(id: string, name: string, email: string, phone: string) {
    super(id, name, email, phone);
    this.balance = 0;
  }

  public issueBook(book: Book, librarian: Librarian) {
    librarian.issueBook(book, this);
  }

  public reserveBook(book: Book, librarian: Librarian) {
    librarian.reserveBook(book, this);
  }

  public cancelReservation(book: Book, librarian: Librarian) {
    librarian.cancelReservation(book, this);
  }

  public searchBookByTitle(
    searchTerm: string,
    libraryManagementService: LibraryManagementService
  ) {
    libraryManagementService.searchBookByTitle(searchTerm);
  }

  public notify(message: string) {
    console.log(message);
  }
}

class System {
  private bookObservers: Map<string, LibraryMember[]>;

  constructor() {
    this.bookObservers = new Map();
  }

  public addBookObserver(book: Book, member: LibraryMember) {
    this.bookObservers.set(book.id, [
      ...(this.bookObservers.get(book.id) || []),
      member,
    ]);
  }

  public removeBookObserver(book: Book, member: LibraryMember) {
    this.bookObservers.set(
      book.id,
      this.bookObservers.get(book.id)?.filter((m) => m !== member) || []
    );
  }

  public sendNotificationBookIsAvailable(book: Book, message: string) {
    this.bookObservers.get(book.id)?.forEach((member) => {
      member.notify(message);
    });
  }
}

class Book {
  public id: string;
  public title: string;
  private author: string;
  private publicationDate: Date;
  private rackNumber: string;
  public barcode: string;
  public reservedTo: LibraryMember | null;
  public issuedTo: LibraryMember | null;
  public dueDate: Date;

  constructor(
    id: string,
    title: string,
    author: string,
    publicationDate: Date,
    rackNumber: string,
    barcode: string,
    reservedTo: LibraryMember | null = null,
    issuedTo: LibraryMember | null = null,
    dueDate: Date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.publicationDate = publicationDate;
    this.rackNumber = rackNumber;
    this.barcode = barcode;
    this.reservedTo = reservedTo;
    this.issuedTo = issuedTo;
    this.dueDate = dueDate;
  }

  public isOverdue(): boolean {
    return this.dueDate < new Date();
  }

  public getOverdueFine(): number {
    return 100;
  }

  public setIssuedTo(member: LibraryMember | null) {
    this.issuedTo = member;
  }

  public setReservedTo(member: LibraryMember | null) {
    this.reservedTo = member;
  }

  public isReserved(): boolean {
    return this.reservedTo !== null;
  }

  public setRackNumber(rackNumber: string) {
    this.rackNumber = rackNumber;
  }
}

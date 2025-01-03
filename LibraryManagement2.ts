enum BookStatus {
  AVAILABLE,
  ISSUED,
  RESERVED,
  LOST,
}

enum BookSubject {
  FICTION,
  SCIENCE,
  HISTORY,
  TECHNOLOGY,
  PHILOSOPHY,
}

interface BookDetails {
  id: string;
  title: string;
  author: string;
  subject: BookSubject;
  publicationDate: Date;
  rackNumber: string;
  barcode: string;
}

interface ILibraryMember {
  addFine(amount: number): void;
  payFine(amount: number): void;
  getDetails(): UserDetails;
}

interface IBook {
  getStatus(): BookStatus;
  getIssuedTo(): LibraryMember | null;
  getDueDate(): Date | null;
  getDetails(): BookDetails;
  setIssuedTo(member: LibraryMember | null, dueDate: Date | null): void;
  setReservedTo(member: LibraryMember | null): void;
  isOverdue(): boolean;
  getOverdueFine(): number;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Base User class
abstract class User {
  constructor(
    public readonly id: string,
    protected name: string,
    protected email: string,
    protected phone: string
  ) {}

  public getDetails(): UserDetails {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
    };
  }
}

// Book class
class Book implements IBook {
  private status: BookStatus = BookStatus.AVAILABLE;
  private issuedTo: LibraryMember | null = null;
  private reservedTo: LibraryMember | null = null;
  private dueDate: Date | null = null;

  constructor(
    public readonly id: string,
    public readonly title: string,
    private author: string,
    private subject: BookSubject,
    private publicationDate: Date,
    private rackNumber: string,
    public readonly barcode: string
  ) {}

  public getDetails(): BookDetails {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      subject: this.subject,
      publicationDate: this.publicationDate,
      rackNumber: this.rackNumber,
      barcode: this.barcode,
    };
  }

  public getStatus(): BookStatus {
    return this.status;
  }

  public getIssuedTo(): LibraryMember | null {
    return this.issuedTo;
  }

  public getDueDate(): Date | null {
    return this.dueDate;
  }

  public setIssuedTo(
    member: LibraryMember | null,
    dueDate: Date | null = null
  ): void {
    this.issuedTo = member;
    this.dueDate = dueDate;
    this.status = member ? BookStatus.ISSUED : BookStatus.AVAILABLE;
  }

  public setReservedTo(member: LibraryMember | null): void {
    this.reservedTo = member;
    this.status = member ? BookStatus.RESERVED : BookStatus.AVAILABLE;
  }

  public isOverdue(): boolean {
    return this.dueDate ? this.dueDate < new Date() : false;
  }

  public getOverdueFine(): number {
    if (!this.isOverdue() || !this.dueDate) return 0;
    const daysOverdue = Math.floor(
      (new Date().getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysOverdue * 10; // $10 per day
  }
}

// Library Member class
class LibraryMember extends User implements ILibraryMember {
  public balance: number = 0;

  constructor(
    id: string,
    name: string,
    email: string,
    phone: string,
    public readonly cardNumber: string
  ) {
    super(id, name, email, phone);
  }

  public addFine(amount: number): void {
    this.balance += amount;
  }

  public payFine(amount: number): void {
    if (amount > this.balance) {
      throw new Error("Payment amount exceeds balance");
    }
    this.balance -= amount;
  }
}

// Librarian class
class Librarian extends User {
  constructor(
    id: string,
    name: string,
    email: string,
    phone: string,
    private service: LibraryManagementService
  ) {
    super(id, name, email, phone);
  }

  public addBook(bookDetails: BookDetails): void {
    const book = new Book(
      bookDetails.id,
      bookDetails.title,
      bookDetails.author,
      bookDetails.subject,
      bookDetails.publicationDate,
      bookDetails.rackNumber,
      bookDetails.barcode
    );
    this.service.addBook(book);
  }

  public issueBook(book: Book, member: LibraryMember): void {
    this.service.issueBook(book, member);
  }

  public returnBook(book: Book, member: LibraryMember): void {
    this.service.returnBook(book, member);
  }

  public collectFine(member: LibraryMember, amount: number): void {
    member.payFine(amount);
  }
}

class LibraryManagementService {
  private indexes: Map<string, Set<string>>;
  private bookInventory: Map<string, Book[]>;
  private memberBorrowings: Map<string, Set<string>>;

  public static readonly MAX_BOOKS_ALLOWED = 5;
  public static readonly MAX_LENDING_DAYS = 10;

  constructor() {
    this.indexes = new Map();
    this.bookInventory = new Map();
    this.memberBorrowings = new Map();
  }

  private addToIndex(key: string, bookId: string): void {
    const ids = this.indexes.get(key) || new Set();
    ids.add(bookId);
    this.indexes.set(key, ids);
  }

  public addBook(book: Book): void {
    const copies = this.bookInventory.get(book.id) || [];
    copies.push(book);
    this.bookInventory.set(book.id, copies);

    // Update unified index with prefixed keys
    this.addToIndex(`title:${book.title}`, book.id);
    this.addToIndex(`author:${book.getDetails().author}`, book.id);
    this.addToIndex(`subject:${book.getDetails().subject}`, book.id);
  }

  private getMemberBorrowings(memberId: string): Set<string> {
    if (!this.memberBorrowings.has(memberId)) {
      this.memberBorrowings.set(memberId, new Set());
    }
    return this.memberBorrowings.get(memberId)!;
  }

  public getBorrowedBooksCount(member: LibraryMember): number {
    return this.getMemberBorrowings(member.id).size;
  }

  public issueBook(book: Book, member: LibraryMember): void {
    if (book.getStatus() !== BookStatus.AVAILABLE) {
      throw new Error("Book is not available");
    }

    const memberBooks = this.getMemberBorrowings(member.id);
    if (memberBooks.size >= LibraryManagementService.MAX_BOOKS_ALLOWED) {
      throw new Error(
        `Member cannot borrow more than ${LibraryManagementService.MAX_BOOKS_ALLOWED} books`
      );
    }

    const dueDate = new Date();
    dueDate.setDate(
      dueDate.getDate() + LibraryManagementService.MAX_LENDING_DAYS
    );

    book.setIssuedTo(member, dueDate);
    memberBooks.add(book.id);
  }

  public returnBook(book: Book, member: LibraryMember): void {
    if (book.getIssuedTo()?.id !== member.id) {
      throw new Error("Book is not issued to this member");
    }

    if (book.isOverdue()) {
      member.addFine(book.getOverdueFine());
    }

    book.setIssuedTo(null);
    this.getMemberBorrowings(member.id).delete(book.id);
  }

  public getBorrowedBooks(member: LibraryMember): Book[] {
    const memberBooks = this.getMemberBorrowings(member.id);
    return Array.from(memberBooks)
      .map((bookId) => {
        const copies = this.bookInventory.get(bookId);
        if (!copies) return null;
        return (
          copies.find((copy) => copy.getIssuedTo()?.id === member.id) || null
        );
      })
      .filter((book): book is Book => book !== null);
  }

  public searchByTitle(title: string): Book[] {
    const bookIds = this.indexes.get(`title:${title}`);
    if (!bookIds) return [];
    return Array.from(bookIds).flatMap(
      (id) => this.bookInventory.get(id) || []
    );
  }

  public searchByAuthor(author: string): Book[] {
    const bookIds = this.indexes.get(`author:${author}`);
    if (!bookIds) return [];
    return Array.from(bookIds).flatMap(
      (id) => this.bookInventory.get(id) || []
    );
  }

  public searchBySubject(subject: BookSubject): Book[] {
    const bookIds = this.indexes.get(`subject:${subject}`);
    if (!bookIds) return [];
    return Array.from(bookIds).flatMap(
      (id) => this.bookInventory.get(id) || []
    );
  }

  public getAvailableCopies(bookId: string): Book[] {
    const copies = this.bookInventory.get(bookId) || [];
    return copies.filter((copy) => copy.getStatus() === BookStatus.AVAILABLE);
  }
}

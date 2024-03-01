import { ParsedQs } from 'qs';

export const parsePaginatedType = (query: ParsedQs): PaginatedType => {
  return {
    pageNumber: parseInt(query.pageNumber as string, 10) || 1,
    pageSize: parseInt(query.pageSize as string, 10) || 10,
    sortBy: (query.sortBy as string) || 'createdAt',
    sortDirection: (query.sortDirection as string) === 'asc' ? 'asc' : 'desc',
    skip:
      (parseInt(query.pageNumber as string, 10) - 1) *
      (parseInt(query.pageSize as string, 10) || 10),
    searchNameTerm: (query.searchNameTerm as string) || undefined,
    searchLoginTerm: (query.searchLoginTerm as string) || undefined,
    searchEmailTerm: (query.searchEmailTerm as string) || undefined,
  };
};

export class Paginated<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];

  constructor(
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
  ) {
    this.pagesCount = pagesCount;
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.items = items;
  }
}

export class PaginatedType {
  pageNumber: number | null = 1;
  pageSize: number | null = 10;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortBy: string | null = null;
  skip: number | null = null;
  searchNameTerm?: string | null = null;
  searchLoginTerm?: string | null = null;
  searchEmailTerm?: string | null = null;

  constructor(query: ParsedQs) {
    this.pageNumber = parseInt(query.pageNumber as string, 10) || 1;
    this.pageSize = parseInt(query.pageSize as string, 10) || 10;
    this.sortBy = (query.sortBy as string) || 'createdAt';
    this.sortDirection =
      (query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
    this.skip = (this.pageNumber - 1) * this.pageSize;
    this.searchNameTerm = query.searchNameTerm as string;
    this.searchLoginTerm = query.searchLoginTerm as string;
    this.searchEmailTerm = query.searchEmailTerm as string;
  }
}

export class DefaultPagination {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: 'asc' | 'desc',
    public skip: number,
  ) {}
}

export type UserPagination = DefaultPagination & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export const getPaginationFromQuery = (
  query: PaginatedType,
): DefaultPagination => {
  const defaultValues: PaginatedType = {
    pageNumber: 1,
    pageSize: 10,
    sortDirection: 'desc',
    sortBy: 'createdAt',
    skip: 0,
  };
  if (query.sortBy) {
    defaultValues.sortBy = query.sortBy;
  }

  if (query.sortDirection && query.sortDirection === 'asc') {
    defaultValues.sortDirection = query.sortDirection;
  }

  if (
    query.pageNumber &&
    !isNaN(parseInt(query.pageNumber.toString(), 10)) &&
    parseInt(query.pageNumber.toString(), 10) > 0
  ) {
    defaultValues.pageNumber = parseInt(query.pageNumber.toString(), 10);
  }

  if (
    query.pageSize &&
    !isNaN(parseInt(query.pageSize.toString(), 10)) &&
    parseInt(query.pageSize.toString(), 10) > 0
  ) {
    defaultValues.pageSize = parseInt(query.pageSize.toString(), 10);
  }

  if (query.searchNameTerm) {
    defaultValues.searchNameTerm = query.searchNameTerm;
  }

  defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize;

  return defaultValues;
};

export const getDefaultPagination = (
  query: PaginatedType,
): DefaultPagination => {
  const defaultValues: DefaultPagination = {
    sortBy: 'createdAt',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 10,
    skip: 0,
  };

  if (query.sortBy) {
    defaultValues.sortBy = query.sortBy;
  }

  if (query.sortDirection && query.sortDirection === 'asc') {
    defaultValues.sortDirection = query.sortDirection;
  }

  if (query.pageNumber && query.pageNumber > 0) {
    defaultValues.pageNumber = +query.pageNumber;
  }

  if (query.pageSize && query.pageSize > 0) {
    defaultValues.pageSize = +query.pageSize;
  }

  defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize;
  return defaultValues;
};

export const getUsersPagination = (query: PaginatedType): UserPagination => {
  const defaultValues: UserPagination = {
    ...getDefaultPagination(query),
    searchEmailTerm: '',
    searchLoginTerm: '',
  };

  if (query.searchEmailTerm)
    defaultValues.searchEmailTerm = query.searchEmailTerm;
  if (query.searchLoginTerm)
    defaultValues.searchLoginTerm = query.searchLoginTerm;

  return defaultValues;
};
 
 
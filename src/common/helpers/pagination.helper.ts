export const buildPagination = (page: number, pageSize: number) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

export const buildMeta = (total: number, page: number, pageSize: number) => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
});

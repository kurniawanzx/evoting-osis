// Mock models for build time
export const MockAdmin = {
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([])
};

export const MockStudent = {
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([]),
  deleteMany: () => Promise.resolve({ deletedCount: 0 }),
  insertMany: () => Promise.resolve([]),
  countDocuments: () => Promise.resolve(0),
  aggregate: () => Promise.resolve([])
};

export const MockCandidate = {
  find: () => Promise.resolve([]),
  findById: () => Promise.resolve(null),
  findByIdAndDelete: () => Promise.resolve(null),
  findByIdAndUpdate: () => Promise.resolve(null),
  countDocuments: () => Promise.resolve(0)
};

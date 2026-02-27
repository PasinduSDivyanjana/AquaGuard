import { Well } from '../models/Well.js';
import { WaterTest } from '../models/Report.js';

export const createWell = async (data) => {
  return Well.create(data);
};

export const getAllWells = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;
  const [wells, total] = await Promise.all([
    Well.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Well.countDocuments(query),
  ]);
  return { wells, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getWellById = async (id) => {
  const well = await Well.findById(id);
  if (!well) {
    const error = new Error('Well not found');
    error.statusCode = 404;
    throw error;
  }
  return well;
};

export const updateWell = async (id, data) => {
  const well = await Well.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!well) {
    const error = new Error('Well not found');
    error.statusCode = 404;
    throw error;
  }
  return well;
};

export const deleteWell = async (id) => {
  const well = await Well.findById(id);
  if (!well) {
    const error = new Error('Well not found');
    error.statusCode = 404;
    throw error;
  }
  const hasExaminations = await WaterTest.exists({ wellId: id });
  if (hasExaminations) {
    const error = new Error('Cannot delete well that has been examined. Remove water tests first.');
    error.statusCode = 400;
    throw error;
  }
  await Well.findByIdAndDelete(id);
  return well;
};

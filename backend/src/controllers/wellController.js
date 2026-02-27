import * as wellService from '../services/wellService.js';
import { getWeatherForWell } from '../services/weatherService.js';

export const createWell = async (req, res, next) => {
  try {
    const well = await wellService.createWell(req.body);
    res.status(201).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

export const getAllWells = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await wellService.getAllWells({ status, search, page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getWellById = async (req, res, next) => {
  try {
    const well = await wellService.getWellById(req.params.id);
    res.status(200).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

export const updateWell = async (req, res, next) => {
  try {
    const well = await wellService.updateWell(req.params.id, req.body);
    res.status(200).json({ success: true, data: well });
  } catch (err) {
    next(err);
  }
};

export const deleteWell = async (req, res, next) => {
  try {
    await wellService.deleteWell(req.params.id);
    res.status(200).json({ success: true, message: 'Well deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getWellWeather = async (req, res, next) => {
  try {
    const payload = await getWeatherForWell(req.params.id);
    res.status(200).json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
};


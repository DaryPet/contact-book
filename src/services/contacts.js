import Contact from '../db/Contact.js';
import calcPaginationData from '../utils/calcPaginationData.js';
import sortOrderList from '../constants/indexSort.js';
import { constantsFieldList } from '../constants/contact-constants.js';

export const getAllContacts = async ({
  filter,
  page,
  perPage,
  sortBy = constantsFieldList[0],
  sortOrder = sortOrderList[0],
}) => {
  const limit = perPage;
  const skip = (page - 1) * limit;

  const constctsQuery = Contact.find();

  if (filter.type) {
    constctsQuery.where('contactType').equals(filter.type);
  }

  if (filter.isFavourite) {
    constctsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const contacts = await constctsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });

  const totalContacts = await Contact.find()
    .merge(constctsQuery)
    .countDocuments();
  const { totalPages, hasNextPage, hasPreviousPage } = calcPaginationData({
    total: totalContacts,
    perPage,
    page,
  });

  return {
    contacts,
    page,
    perPage,
    totalContacts,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};

export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const result = await Contact.findOneAndUpdate({ _id: contactId }, payload, {
    // new: true,
    includeResultMetadata: true,
    ...options,
  });
  if (!result || !result.value) return null;

  const isNew = Boolean(result?.lastErrorObject?.upserted);
  return {
    data: result.value,
    isNew,
  };
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findOneAndDelete({
    _id: contactId,
  });
  return contact;
};

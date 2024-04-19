import { db } from "~/utils/db.server";
import { slugify } from "~/utils/helpers";
import { BusinessData } from "~/utils/validation";

export const getUserById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
};

export const getBusinessByOwnerId = async (ownerId: string) => {
  return db.business.findFirst({ where: { ownerId } });
};

export const createBusiness = async (data: BusinessData, ownerId: string) => {
  return db.business.create({
    data: {
      name: data.name,
      tagline: data.tagline,
      about: data.about,
      location: data.location,
      instagram: data.instagram,
      whatsApp: data.whatsApp,
      email: data.email,
      phone: data.phone,
      typeId: data.typeId,
      ownerId,
    },
  });
};

export const updateBusiness = async (ownerId: string, data: BusinessData) => {
  return db.business.update({ where: { ownerId }, data });
};

export const getNumberOfBusinessTypes = async () => {
  return db.businessType.count();
};

export const createBusinessType = async (name: string) => {
  return db.businessType.create({ data: { name, slug: slugify(name) } });
};

export const getBusinessTypes = async () => {
  return db.businessType.findMany();
};

export const getBusinessTypeBySlug = async (slug: string) => {
  return db.businessType.findUnique({ where: { slug } });
};

export const getBusinessByType = async (typeId: string) => {
  return db.business.findMany({
    where: { typeId, isVerified: true },
    include: { owner: true },
  });
};

export const getBusinessById = async (id: string) => {
  return db.business.findUnique({ where: { id } });
};

export const getNumberOfBusinesses = async () => {
  return db.business.count();
};

export const getNumberOfVerifiedBusinesses = async () => {
  return db.business.count({ where: { isVerified: true } });
};

export const getAllBusinesses = async () => {
  return db.business.findMany({ include: { owner: true } });
};

export const toggleBusinessVerification = async (id: string) => {
  const business = await db.business.findUnique({ where: { id } });

  if (!business) {
    throw new Error("Business not found");
  }

  return db.business.update({
    where: { id },
    data: { isVerified: !business.isVerified },
  });
};

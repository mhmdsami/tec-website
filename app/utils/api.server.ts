import { db } from "~/utils/db.server";
import { slugify } from "~/utils/helpers.server";
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

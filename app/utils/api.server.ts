import { db } from "~/utils/db.server";
import { slugify } from "~/utils/helpers";
import { BusinessOnboardingData } from "~/utils/validation";

export const getUserById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
};

export const getBusinessByOwnerId = async (ownerId: string) => {
  return db.business.findFirst({ where: { ownerId } });
};

export const createBusiness = async (
  data: BusinessOnboardingData,
  ownerId: string,
) => {
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

export const updateBusiness = async (
  id: string,
  data: BusinessOnboardingData,
) => {
  return db.business.update({ where: { id }, data });
};

export const createBusinessType = async (name: string) => {
  return db.businessType.create({ data: { name, slug: slugify(name) } });
};

export const getBusinessTypes = async () => {
  return db.businessType.findMany();
};

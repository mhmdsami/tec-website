import { Prisma } from "@prisma-app/client";
import { db } from "~/utils/db.server";
import { slugify } from "~/utils/helpers";

export const getUserById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
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

export const deleteBusinessType = async (id: string) => {
  return db.businessType.delete({ where: { id } });
};

export const createBusiness = async (
  business: Omit<Prisma.BusinessCreateInput, "owner" | "type">,
  typeId: string,
  ownerId: string,
) => {
  return db.business.create({
    data: {
      name: business.name,
      tagline: business.tagline,
      about: business.about,
      location: business.location,
      instagram: business.instagram,
      whatsApp: business.whatsApp,
      email: business.email,
      phone: business.phone,
      type: {
        connect: { id: typeId },
      },
      owner: {
        connect: { id: ownerId },
      },
    },
  });
};

export const getAllBusinesses = async () => {
  return db.business.findMany({ include: { owner: true } });
};

export const getBusinessById = async (id: string) => {
  return db.business.findUnique({ where: { id } });
};

export const getBusinessByOwnerId = async (ownerId: string) => {
  return db.business.findFirst({ where: { ownerId } });
};

export const getBusinessByType = async (typeId: string) => {
  return db.business.findMany({
    where: { typeId, isVerified: true },
    include: { owner: true },
  });
};

export const updateBusiness = async (
  ownerId: string,
  data: Prisma.BusinessUpdateInput,
) => {
  return db.business.update({ where: { ownerId }, data });
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

export const makeEnquiry = async (
  enquiry: Omit<Prisma.EnquiryCreateInput, "business">,
  businessId: string,
) => {
  return db.enquiry.create({
    data: {
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      business: {
        connect: { id: businessId },
      },
    },
  });
};

export const getNumberOfBusinessTypes = async () => {
  return db.businessType.count();
};

export const getNumberOfBusinesses = async () => {
  return db.business.count();
};

export const getNumberOfVerifiedBusinesses = async () => {
  return db.business.count({ where: { isVerified: true } });
};

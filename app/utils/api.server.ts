import { Prisma } from "@prisma-app/client";
import { db } from "~/utils/db.server";
import { slugify } from "~/utils/helpers";

export const getUserById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
};

export const createBusinessCategory = async (name: string) => {
  return db.businessCategory.create({ data: { name, slug: slugify(name) } });
};

export const getBusinessCategoryBySlug = async (slug: string) => {
  return db.businessCategory.findUnique({ where: { slug } });
};

export const getBusinessCategories = async () => {
  return db.businessCategory.findMany();
};

export const getBusinessCategoryWithTypes = async () => {
  return db.businessCategory.findMany({ include: { types: true } });
};

export const getBusinessCategoryWithTypeBySlug = async (slug: string) => {
  return db.businessCategory.findUnique({
    where: { slug },
    include: { types: true },
  });
};

export const createBusinessType = async (
  name: string,
  businessCategoryId: string,
) => {
  return db.businessType.create({
    data: { name, slug: slugify(name), businessCategoryId },
  });
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
      logo: business.logo,
      location: business.location,
      instagram: business.instagram,
      whatsApp: business.whatsApp,
      email: business.email,
      phone: business.phone,
      coverImage: business.coverImage,
      linkedIn: business.linkedIn,
      facebook: business.facebook,
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

export const getAllVerifiedBusinesses = async () => {
  return db.business.findMany({
    where: { isVerified: true },
    include: { owner: true },
  });
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

export const getBusinessCountByType = async (typeId: string) => {
  return db.business.count({ where: { typeId } });
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
  enquiry: Omit<Prisma.BusinessEnquiryCreateInput, "business">,
  businessId: string,
) => {
  return db.businessEnquiry.create({
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

export const getEnquiriesByBusinessId = async (businessId: string) => {
  return db.businessEnquiry.findMany({ where: { businessId } });
};

export const toggleMarkEnquiryAsResolved = async (id: string) => {
  const enquiry = await db.businessEnquiry.findUnique({ where: { id } });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  return db.businessEnquiry.update({
    where: { id },
    data: { isResolved: !enquiry.isResolved },
  });
};

export const createEvent = async (event: Prisma.EventCreateInput) => {
  return db.event.create({
    data: {
      title: event.title,
      description: event.description,
      date: event.date,
    },
  });
};

export const getLatestEvents = async () => {
  return db.event.findMany({ take: 2, orderBy: { createdAt: "desc" } });
};

export const getAllEvents = async () => {
  return db.event.findMany();
};

export const getEventById = async (id: string) => {
  return db.event.findUnique({ where: { id } });
};

export const addEventImage = async (
  id: string,
  url: string,
  description: string,
) => {
  return db.event.update({
    where: { id },
    data: {
      images: {
        push: { url, description },
      },
    },
  });
};

export const deleteEvent = async (id: string) => {
  return db.event.delete({ where: { id } });
};

export const getNumberOfBlogs = async () => {
  return db.blog.count();
};

export const createBlog = async (blog: Prisma.BlogCreateInput) => {
  return db.blog.create({
    data: {
      title: blog.title,
      description: blog.description,
      content: blog.content,
      image: blog.image,
    },
  });
};

export const getLatestBlogs = async () => {
  return db.blog.findMany({ take: 2 });
};

export const getAllBlogs = async () => {
  return db.blog.findMany();
};

export const getBlogById = async (id: string) => {
  return db.blog.findUnique({ where: { id } });
};

export const deleteBlog = async (id: string) => {
  return db.blog.delete({ where: { id } });
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

export const getNumberOfEvents = async () => {
  return db.event.count();
};

export const createService = async (
  service: Omit<Prisma.ServiceCreateInput, "business">,
  businessId: string,
) => {
  return db.service.create({
    data: {
      title: service.title,
      description: service.description,
      image: service.image,
      business: {
        connect: { id: businessId },
      },
    },
  });
};

export const getServicesByBusinessId = async (businessId: string) => {
  return db.service.findMany({ where: { businessId } });
};

export const updateService = async (
  id: string,
  data: Prisma.ServiceUpdateInput,
) => {
  return db.service.update({ where: { id }, data });
};

export const deleteService = async (id: string) => {
  return db.service.delete({ where: { id } });
};

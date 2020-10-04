import {Request, RequestHandler} from "express"
import {Model} from "mongoose"

import Advert, {IAdvert} from "../models/Advert"
import Booking, {IBooking} from "../models/Booking"
import Cabin, {ICabin} from "../models/Cabin"
import User, {IUser} from "../models/User"

type ResourceName = "user" | "cabin" | "advert" | "booking"

type ResourceMap = {
  [K in ResourceName]: {
    model: Model<any>
    authorIndicatingPath: string
    verifyValidity: (
      id: string,
      resources: Request["resources"],
      resource?: IUser | ICabin | IAdvert | IBooking | null,
    ) => boolean
  }
}

const resourceMap: ResourceMap = {
  user: {
    model: User,
    authorIndicatingPath: "_id",
    verifyValidity: (id, resources = {}, resource = resources?.user) =>
      resource != null ? resource._id === id : true,
  },
  cabin: {
    model: Cabin,
    authorIndicatingPath: "owner",
    verifyValidity: (id, resources = {}, resource = resources?.cabin) =>
      resource != null
        ? resource._id === id &&
          resourceMap.user.verifyValidity((resource as ICabin).owner, resources)
        : true,
  },
  advert: {
    model: Advert,
    authorIndicatingPath: "advertiser",
    verifyValidity: (id, resources = {}, resource = resources.advert) =>
      resource != null
        ? resource._id === id &&
          resourceMap.cabin.verifyValidity(
            (resource as IAdvert).cabin,
            resources,
          )
        : true,
  },
  booking: {
    model: Booking,
    authorIndicatingPath: "user",
    verifyValidity: (id, resources = {}, resource = resources.booking) =>
      resource != null
        ? resource._id === id &&
          resourceMap.advert.verifyValidity(
            (resource as IBooking).advert,
            resources,
          )
        : true,
  },
}

const createGetResourceFromURLMiddleware = (
  resourceName: ResourceName,
  onlyAuthor?: boolean,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const {model, authorIndicatingPath, verifyValidity} = resourceMap[
        resourceName
      ]
      const resource = await model.findById(req.params[resourceName])
      if (
        resource == null ||
        verifyValidity(resource?._id, req.resources, resource)
      ) {
        res.sendStatus(404)
        return
      }
      if (
        onlyAuthor === true &&
        resource[authorIndicatingPath] !== req.user?.id
      ) {
        res.sendStatus(403)
        return
      }
      if (req.resources == null) req.resources = {}
      req.resources[model.collection.name.toLowerCase()] = resource
      next()
    } catch (error) {
      console.error(error)
      res.sendStatus(404)
    }
  }
}

export default createGetResourceFromURLMiddleware

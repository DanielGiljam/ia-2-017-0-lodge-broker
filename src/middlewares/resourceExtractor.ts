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
      id: any,
      resources: Request["resources"],
      resource?: IUser | ICabin | IAdvert | IBooking | null,
    ) => boolean
  }
}

const resourceMap: ResourceMap = {
  user: {
    model: User,
    authorIndicatingPath: "_id",
    verifyValidity: (id, resources = {}, resource = resources.user) => {
      // console.log("VERIFY VALIDITY - USER:", resource != null ? resource._id.equals(id) === true : true)
      // console.log("id:", id)
      // console.log("resources:", resources)
      // console.log("resource:", resource)
      return resource != null ? resource._id.equals(id) === true : true
    },
  },
  cabin: {
    model: Cabin,
    authorIndicatingPath: "owner",
    verifyValidity: (id, resources = {}, resource = resources.cabin) => {
      // console.log("VERIFY VALIDITY - CABIN:", resource != null ? resource._id.equals(id) === true : true)
      // console.log("id:", id)
      // console.log("resources:", resources)
      // console.log("resource:", resource)
      return resource != null
        ? resource._id.equals(id) === true &&
            resourceMap.user.verifyValidity(
              (resource as ICabin).owner,
              resources,
            )
        : true
    },
  },
  advert: {
    model: Advert,
    authorIndicatingPath: "advertiser",
    verifyValidity: (id, resources = {}, resource = resources.advert) => {
      // console.log("VERIFY VALIDITY - ADVERT:", resource != null ? resource._id.equals(id) === true : true)
      // console.log("id:", id)
      // console.log("resources:", resources)
      // console.log("resource:", resource)
      return resource != null
        ? resource._id.equals(id) === true &&
            resourceMap.cabin.verifyValidity(
              (resource as IAdvert).cabin,
              resources,
            )
        : true
    },
  },
  booking: {
    model: Booking,
    authorIndicatingPath: "user",
    verifyValidity: (id, resources = {}, resource = resources.booking) => {
      // console.log("VERIFY VALIDITY - BOOKING:", resource != null ? resource._id.equals(id) === true : true)
      // console.log("id:", id)
      // console.log("resources:", resources)
      // console.log("resource:", resource)
      return resource != null
        ? resource._id.equals(id) === true &&
            resourceMap.advert.verifyValidity(
              (resource as IBooking).advert,
              resources,
            )
        : true
    },
  },
}

const resourceExtractor = (
  resourceName: ResourceName,
  onlyAuthor?: boolean,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      console.log(
        `Extracting ${resourceName} "${req.params[resourceName]}" from URL...`,
      )
      const {model, authorIndicatingPath, verifyValidity} = resourceMap[
        resourceName
      ]
      const resource = await model.findById(req.params[resourceName])
      if (
        resource == null ||
        !verifyValidity(resource?._id, req.resources, resource)
      ) {
        res.status(404).json({status: "Not Found"})
        return
      }
      if (
        onlyAuthor === true &&
        resource[authorIndicatingPath] !== req.user?.id
      ) {
        res.status(403).json({status: "Forbidden"})
        return
      }
      console.log("resources:", req.resources)
      if (req.resources == null) req.resources = {}
      req.resources[resourceName] = resource
      next()
    } catch (error) {
      console.error(error)
      res.status(404).json({status: "Not Found"})
    }
  }
}

export default resourceExtractor

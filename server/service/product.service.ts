//Purpose createProduct, findProduct, findandUpdateProduct, deleteProduct

import { FilterQuery, UpdateQuery } from "mongoose";
import ProductModel, { ProductDocument, ProductInput } from "../model/product.model";
import { dbAPIResponseTimeHistogram } from "../utils/metrics";

export const createProduct = async (input: ProductInput) => {
    const metricsLabel = {
        'operation': 'Create Product'
    }
    const timer = dbAPIResponseTimeHistogram.startTimer()
    try{
    const product = await ProductModel.create(input);
    timer({...metricsLabel, success: 'true'})
    return product
    }catch(e:any){
        timer({...metricsLabel, success: 'false'})
        throw new Error(e);
    }
}

export const findProduct = async (query: FilterQuery<ProductDocument>) => {
    const metricLabel = {
        'operation': 'Find Product'
    }
    const timer = dbAPIResponseTimeHistogram.startTimer()
    try{
        const product = await ProductModel.findOne(query).lean();
        timer({...metricLabel, success: 'true'})
        return product
    }catch(e:any){
        timer({...metricLabel, success: 'true'})
        throw new Error(e);
    }
}

export const findProductAndUpdate = async(query: FilterQuery<ProductDocument>, update: UpdateQuery<ProductDocument>) => {
    try{
        return ProductModel.findOneAndUpdate(query, update, {new: true});
    }catch(e:any){
        throw new Error(e)
    }
}

export const deleteProduct = async(query: FilterQuery<ProductDocument>) => {
    try{
        return ProductModel.deleteOne(query);
    }catch(e:any){
        throw new Error(e)
    }
}
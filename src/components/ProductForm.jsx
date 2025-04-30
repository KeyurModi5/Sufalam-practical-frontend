import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../services/productService";

const ProductForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
    setError,
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      image: null,
      attributes: [{ key: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const loadProduct = async () => {
    const product = await getProductById(id);
    setValue("name", product.name);
    setValue("price", product.price);
    setValue(
      "attributes",
      product.attributes.length ? product.attributes : [{ key: "", value: "" }]
    );
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const onSubmit = async (data) => {
    const file = data.image?.[0];

    if (!file) {
      setError("image", {
        type: "manual",
        message: "Product image is required",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("image", {
        type: "manual",
        message: "Only image files are allowed",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("attributes", JSON.stringify(data.attributes));
    formData.append("image", file);

    let res;
    if (id) {
      res = await updateProduct(id, formData);
    } else {
      res = await createProduct(formData);
    }

    if (res?.message) {
      toast.success(res.message);
      navigate("/");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        {id ? "Edit Product" : "Create Product"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            {...register("name", {
              required: "Product name is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            })}
            className={`w-full border rounded-lg p-3 outline-none ${
              errors.name ? "border-red-500" : ""
            }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            {...register("price", {
              required: "Price is required",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Enter a valid price",
              },
            })}
            type="number"
            step="0.01"
            className={`w-full border rounded-lg p-3 outline-none ${
              errors.price ? "border-red-500" : ""
            }`}
            placeholder="Enter price"
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("image", {
              validate: {
                isImage: (files) =>
                  files?.[0]?.type.startsWith("image/") ||
                  "Only image files are allowed",
              },
            })}
            className="w-full border rounded-lg p-3"
          />
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image.message}</p>
          )}
        </div>

        {/* Attributes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Attributes</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4 mb-3">
              <input
                {...register(`attributes.${index}.key`, {
                  required: "Key is required",
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
                placeholder="Key"
                className={`w-1/2 border rounded-lg p-2 outline-none ${
                  errors.attributes?.[index]?.key ? "border-red-500" : ""
                }`}
              />
              <input
                {...register(`attributes.${index}.value`, {
                  required: "Value is required",
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
                placeholder="Value"
                className={`w-1/2 border rounded-lg p-2 outline-none ${
                  errors.attributes?.[index]?.value ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="mt-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            + Add Attribute
          </button>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            {id ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

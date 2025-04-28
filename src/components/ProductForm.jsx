import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProductForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      attributes: [{ key: "", value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const [image, setImage] = useState(null);

  const handleRemoveImage = () => {
    setImage(null);
    document.getElementById("file-input").value = "";
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    const product = await getProductById(id);
    setValue("name", product.name);
    setValue("price", product.price);
    setValue(
      "attributes",
      product.attributes.length ? product.attributes : [{ key: "", value: "" }]
    );
  };

  const validateFormData = (data, image) => {
    const errors = [];

    // Validate 'name'
    if (!data.name || data.name.trim() === "") {
      errors.push("Product name is required.");
    }

    // Validate 'price'
    if (!data.price || isNaN(data.price) || data.price <= 0) {
      errors.push("Product price must be a valid positive number.");
    }

    // Validate 'attributes'
    if (
      !data.attributes ||
      !Array.isArray(data.attributes) ||
      data.attributes.length === 0
    ) {
      errors.push(
        "Product attributes must be a valid array with at least one item."
      );
    }

    // Validate 'image'
    if (image && !(image instanceof File)) {
      errors.push("The uploaded image must be a valid file.");
    }

    return errors;
  };

  const onSubmit = async (data) => {
    const validationErrors = validateFormData(data, image);

    if (validationErrors.length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("attributes", JSON.stringify(data.attributes));
    if (image) formData.append("image", image);

    if (id) {
      let data = await updateProduct(id, formData);
      if (data.message) {
        toast.success(data.message);
      }
    } else {
      let data = await createProduct(formData);
      if (data.message) {
        toast.success(data.message);
      }
    }
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        {id ? "Edit Product" : "Create Product"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            {...register("name", {
              required: "Product name is required",
              maxLength: {
                value: 100,
                message: "Max length is 100 characters",
              },
            })}
            placeholder="Enter product name"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
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
            placeholder="Enter price"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              errors.price ? "border-red-500" : ""
            }`}
          />
          {errors.price && (
            <span className="text-red-500 text-sm">{errors.price.message}</span>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            id="file-input"
            type="file"
            onChange={(e) => setImage(e?.target?.files[0])}
            className="w-full border rounded-lg p-3"
          />
          {image && (
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-800">{image.name}</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
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
                })}
                placeholder="Key"
                className={`w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none ${
                  errors.attributes?.[index]?.key ? "border-red-500" : ""
                }`}
              />
              {errors.attributes?.[index]?.key && (
                <span className="text-red-500 text-sm">
                  {errors.attributes[index].key.message}
                </span>
              )}

              <input
                {...register(`attributes.${index}.value`, {
                  required: "Value is required",
                })}
                placeholder="Value"
                className={`w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none ${
                  errors.attributes?.[index]?.value ? "border-red-500" : ""
                }`}
              />
              {errors.attributes?.[index]?.value && (
                <span className="text-red-500 text-sm">
                  {errors.attributes[index].value.message}
                </span>
              )}

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
            className="mt-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            + Add Attribute
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            {id ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

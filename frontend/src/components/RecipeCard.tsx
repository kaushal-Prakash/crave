"use client";
import { recipe } from "@/types/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlinePushPin } from "react-icons/md";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { toast } from "react-toastify";
import axios from "axios";

function RecipeCard({ title, description, created_at, id, user_id }: recipe) {
  const router = useRouter();
  const [isPinning, setIsPinning] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId));
    }
  }, []);

  const formatAbsoluteDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncatedDescription =
    description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

  const handleViewFullRecipe = () => {
    router.push(`/recipes/${id}`);
  };

  const handleClick = async () => {
    setIsPinning(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/add-to-fav/${id}`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
      } else {
        toast.error("Failed to add recipe to favorites");
      }
    } catch (error) {
      console.log("Error adding favorites: ", error);
      toast.error("Internal server error! Please try again.");
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-inner hover:shadow-lg transition-all duration-300 ease-in-out max-h-60 flex flex-col justify-between hover:-translate-y-2 relative">
      <div>
        <button
          className="absolute right-3 top-3 cursor-pointer transition-all duration-200 hover:text-orange-600 hover:scale-110 backface-hidden hover:shadow-2xl"
          onClick={handleClick}
          disabled={isPinning}
        >
          <MdOutlinePushPin
            size={30}
            className={isPinning ? "opacity-50" : ""}
          />
        </button>

        {currentUserId === user_id && (
          <button
            className="absolute right-12 top-3 cursor-pointer transition-all hover:shadow-2xl duration-200 hover:text-orange-600 hover:scale-110 backface-hidden"
            onClick={() => (window.location.href = `/update-recipe/${id}`)}
          >
            <HiOutlinePencilSquare size={25} />
          </button>
        )}
        <h3 className="text-lg font-semibold mt-3 text-gray-800">{title}</h3>
        <p
          className="text-sm text-gray-600 mt-2"
          dangerouslySetInnerHTML={{ __html: truncatedDescription }}
        ></p>
        <p className="text-xs text-gray-400 mt-2">
          Created At {formatAbsoluteDate(created_at)}
        </p>
      </div>
      <button
        onClick={handleViewFullRecipe}
        className="mt-4 bg-gradient-to-r from-green-400 to-orange-500 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-orange-600 transition-colors duration-300 ease-in-out cursor-pointer font-semibold"
      >
        View Full Recipe
      </button>
    </div>
  );
}

export default RecipeCard;
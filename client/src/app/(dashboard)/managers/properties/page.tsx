"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import React from "react";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const cognitoId =
    authUser?.cognitoInfo?.username || authUser?.userInfo?.cognitoId || "";
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(cognitoId, {
    skip: !cognitoId,
  });

  if (!authUser) return <Loading />;
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">Error loading properties</p>
        <p className="text-red-600 text-sm mt-2">
          Please refresh or contact support
        </p>
      </div>
    );

  return (
    <div className="dashboard-container">
      <Header
        title="My Properties"
        subtitle="View and manage your property listings"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managerProperties?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/managers/properties/${property.id}`}
          />
        ))}
      </div>
      {(!managerProperties || managerProperties.length === 0) && (
        <p>You don&lsquo;t manage any properties</p>
      )}
    </div>
  );
};

export default Properties;

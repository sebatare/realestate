"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
    error,
  } = useGetPropertiesQuery(filters);

  // Debug logging
  useEffect(() => {
    console.log("Map component state:", {
      isLoading,
      isError,
      error,
      propertiesCount: properties?.length,
      filters: { location: filters.location, coordinates: filters.coordinates },
    });
  }, [isLoading, isError, error, properties?.length, filters]);

  useEffect(() => {
    if (isLoading || isError || !properties || properties.length === 0) return;
    if (!mapContainerRef.current) return;

    // Validar coordenadas y evitar valores por defecto inválidos
    const center: [number, number] =
      filters.coordinates &&
      filters.coordinates[0] !== 0 &&
      filters.coordinates[1] !== 0
        ? (filters.coordinates as [number, number])
        : ([-74.5, 40] as [number, number]);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/sebatapiareb/cmcbp80e0004501qibgx8c52u",
      center,
      zoom: 9,
    });

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      if (marker) {
        const markerElement = marker.getElement();
        const path = markerElement.querySelector("path[fill='#3FB1CE']");
        if (path) path.setAttribute("fill", "#000000");
      }
    });

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700);
    };
    resizeMap();

    return () => map.remove();
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        <p className="mt-4">Loading map...</p>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <p className="font-semibold">Failed to load map</p>
        <p className="text-sm mt-2">Check your connection or try a different location</p>
      </div>
    );
  if (!properties || properties.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>No properties found</p>
        <p className="text-sm mt-2">Try adjusting your filters</p>
      </div>
    );

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map): mapboxgl.Marker | null => {
  // Validar que existan las coordenadas
  if (!property.location?.coordinates) return null;
  
  const { longitude, latitude } = property.location.coordinates;
  if (!longitude || !latitude || (longitude === 0 && latitude === 0)) return null;

  const marker = new mapboxgl.Marker()
    .setLngLat([longitude, latitude])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `,
      ),
    )
    .addTo(map);
  return marker;
};

export default Map;

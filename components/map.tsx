"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useFamily } from "@/contexts/FamilyContext";

interface ShelterFeature {
  type: string;
  properties: {
    類別: string;
    地址: string;
    經度: string;
    緯度: string;
    村里別?: string;
    可容納人數?: string;
    "地下樓 層數"?: string;
    派出所?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

// You'll need to add your Mapbox access token here
// Get one from https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.YOUR_MAPBOX_TOKEN_HERE";

mapboxgl.accessToken = MAPBOX_TOKEN;

export interface ShelterMapRef {
  flyToCommonShelter: () => void;
}

export const ShelterMap = forwardRef<ShelterMapRef>((props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { familyData } = useFamily();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    flyToCommonShelter: () => {
      if (map.current && familyData.commonShelter?.coordinates) {
        map.current.flyTo({
          center: familyData.commonShelter.coordinates,
          zoom: 16,
          duration: 1500,
          essential: true,
        });
      }
    },
  }));

  // Initial map setup - runs ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on New Taipei City
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [121.4685, 25.0458], // New Taipei City coordinates
      zoom: 11,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        // Load the shelter data from both cities
        const [newTaipeiResponse, taipeiResponse] = await Promise.all([
          fetch("/json/新北市.json"),
          fetch("/json/臺北市.json"),
        ]);

        const newTaipeiData = await newTaipeiResponse.json();
        const taipeiData = await taipeiResponse.json();

        // Combine shelter data from both cities
        const shelterData = {
          type: "FeatureCollection" as const,
          features: [...newTaipeiData.features, ...taipeiData.features],
        };

        // Helper function to check if coordinates match a shelter (within ~10 meters)
        const findShelterAtLocation = (coords: [number, number]) => {
          const [lng, lat] = coords;
          return shelterData.features.find((feature: ShelterFeature) => {
            const [shelterLng, shelterLat] = feature.geometry.coordinates;
            const distance = Math.sqrt(
              Math.pow(shelterLng - lng, 2) + Math.pow(shelterLat - lat, 2),
            );
            return distance < 0.0001; // approximately 10 meters
          });
        };

        // Add the shelter data as a source
        map.current.addSource("shelters", {
          type: "geojson",
          data: shelterData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add cluster circle layer with design system colors
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "shelters",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#5ab4c5", // primary-500
              100,
              "#f5ba4b", // secondary-500
              750,
              "#fd853a", // orange-500
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
            "circle-opacity": 0.9,
          },
        });

        // Add cluster count layer
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "shelters",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add unclustered point layer (individual shelters) with primary color
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "shelters",
          filter: [
            "all",
            ["!", ["has", "point_count"]],
            ["!=", ["get", "地址"], "__COMMON_SHELTER__"],
          ],
          paint: {
            "circle-color": "#5ab4c5", // primary-500
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.9,
          },
        });

        // Add common shelter point layer (highlighted when unclustered)
        map.current.addLayer({
          id: "common-shelter-point",
          type: "circle",
          source: "shelters",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "地址"], "__COMMON_SHELTER__"]],
          paint: {
            "circle-color": "#f5ba4b", // secondary-500
            "circle-radius": 16,
            "circle-stroke-width": 4,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });

        // Add pulsing animation layer for common shelter
        map.current.addLayer({
          id: "common-shelter-pulse",
          type: "circle",
          source: "shelters",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "地址"], "__COMMON_SHELTER__"]],
          paint: {
            "circle-color": "#f5ba4b",
            "circle-radius": 30,
            "circle-opacity": 0.4,
          },
        });

        // Add click event for clusters
        map.current.on("click", "clusters", (e) => {
          if (!map.current) return;
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current.getSource(
            "shelters",
          ) as mapboxgl.GeoJSONSource;

          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current || zoom === null || zoom === undefined)
              return;

            map.current.easeTo({
              center: (features[0].geometry as { coordinates: [number, number] }).coordinates,
              zoom: zoom,
            });
          });
        });

        // Add click event for individual shelters (NO BUTTON TO SET COMMON SHELTER)
        const handleShelterClick = (e: mapboxgl.MapMouseEvent) => {
          if (!map.current || !e.features || e.features.length === 0) return;

          const coordinates = (
            e.features[0].geometry as { coordinates: [number, number] }
          ).coordinates.slice();
          const properties = e.features[0].properties;

          // Detect dark mode
          const isDark = document.documentElement.classList.contains("dark");

          // Create popup content WITHOUT the set shelter button
          const popupContent = `
            <div class="shelter-popup">
              <h3 class="shelter-popup-title">${properties?.類別 || "N/A"}</h3>
              <div class="shelter-popup-content">
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">地址:</span>
                  <span class="shelter-popup-value">${properties?.地址 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">村里別:</span>
                  <span class="shelter-popup-value">${properties?.村里別 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">可容納人數:</span>
                  <span class="shelter-popup-value">${properties?.可容納人數 || "N/A"}</span>
                </div>
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">地下樓層數:</span>
                  <span class="shelter-popup-value">${properties?.["地下樓 層數"] || "N/A"}</span>
                </div>
                ${
                  properties?.派出所
                    ? `
                <div class="shelter-popup-row">
                  <span class="shelter-popup-label">派出所:</span>
                  <span class="shelter-popup-value">${properties.派出所}</span>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          `;

          new mapboxgl.Popup({
            maxWidth: "320px",
            className: `shelter-popup-container ${isDark ? "dark" : ""}`,
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);
        };

        map.current.on("click", "unclustered-point", handleShelterClick);
        map.current.on("click", "common-shelter-point", handleShelterClick);

        // Change cursor on hover
        map.current.on("mouseenter", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
        map.current.on("mouseenter", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
        map.current.on("mouseenter", "common-shelter-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "common-shelter-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        // Load avatar images and add emergency contacts layer
        const loadContactsLayer = async (members: typeof familyData.members) => {
          if (!map.current) return;

          // Remove existing contacts layer if it exists
          if (map.current.getLayer("emergency-contacts")) {
            map.current.removeLayer("emergency-contacts");
          }
          if (map.current.getSource("emergency-contacts")) {
            map.current.removeSource("emergency-contacts");
          }

          // Remove existing avatar images
          members.forEach((contact) => {
            if (map.current?.hasImage(`avatar-${contact.id}`)) {
              map.current.removeImage(`avatar-${contact.id}`);
            }
          });

          // Load avatar images for emergency contacts
          const avatarPromises = members.map((contact) => {
            return new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                // Check if contact is at shelter
                const shelter = findShelterAtLocation(contact.coordinates);
                const isAtShelter = !!shelter;

                // Create a canvas to draw the circular avatar with border
                const size = 128;
                const borderWidth = 6;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");

                if (ctx && map.current) {
                  // Clear canvas
                  ctx.clearRect(0, 0, size, size);

                  // Draw border circle - primary color if at shelter, red if outside
                  ctx.beginPath();
                  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                  ctx.fillStyle = isAtShelter ? "#5ab4c5" : "#ef4444"; // primary-500 or red-500
                  ctx.fill();

                  // Draw white inner circle for spacing
                  ctx.beginPath();
                  ctx.arc(
                    size / 2,
                    size / 2,
                    size / 2 - borderWidth,
                    0,
                    Math.PI * 2,
                  );
                  ctx.fillStyle = "#ffffff";
                  ctx.fill();

                  // Clip to circle for the image
                  ctx.beginPath();
                  ctx.arc(
                    size / 2,
                    size / 2,
                    size / 2 - borderWidth,
                    0,
                    Math.PI * 2,
                  );
                  ctx.clip();

                  // Calculate dimensions to fit image in circle without stretching
                  const scale = Math.max(size / img.width, size / img.height);
                  const scaledWidth = img.width * scale;
                  const scaledHeight = img.height * scale;
                  const x = (size - scaledWidth) / 2;
                  const y = (size - scaledHeight) / 2;

                  // Draw the image
                  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                  // Convert canvas to image data
                  canvas.toBlob((blob) => {
                    if (blob) {
                      createImageBitmap(blob).then((imageBitmap) => {
                        if (map.current) {
                          map.current.addImage(
                            `avatar-${contact.id}`,
                            imageBitmap,
                            {
                              sdf: false,
                            },
                          );
                        }
                        resolve();
                      });
                    } else {
                      resolve();
                    }
                  });
                } else {
                  resolve();
                }
              };
              img.onerror = () => {
                console.error(`Error loading avatar ${contact.avatar}`);
                reject(new Error(`Failed to load ${contact.avatar}`));
              };
              img.src = contact.avatar;
            });
          });

          await Promise.all(avatarPromises);

          // Add emergency contacts as a source
          const contactsGeoJSON = {
            type: "FeatureCollection" as const,
            features: members.map((contact) => {
              const shelter = findShelterAtLocation(contact.coordinates);
              const isAtShelter = !!shelter;

              return {
                type: "Feature" as const,
                properties: {
                  id: contact.id,
                  name: contact.name,
                  phone: contact.phone,
                  relation: contact.relation,
                  status: isAtShelter ? "at_shelter" : "outside",
                  shelterName: shelter?.properties.類別 || null,
                  shelterAddress: shelter?.properties.地址 || null,
                },
                geometry: {
                  type: "Point" as const,
                  coordinates: contact.coordinates,
                },
              };
            }),
          };

          map.current.addSource("emergency-contacts", {
            type: "geojson",
            data: contactsGeoJSON,
          });

          // Add emergency contacts layer with avatar icons
          map.current.addLayer({
            id: "emergency-contacts",
            type: "symbol",
            source: "emergency-contacts",
            layout: {
              "icon-image": ["concat", "avatar-", ["get", "id"]],
              "icon-size": 0.5,
              "icon-allow-overlap": true,
              "icon-anchor": "center",
            },
          });

          // Add click event for emergency contacts
          map.current.on("click", "emergency-contacts", (e) => {
            if (!map.current || !e.features || e.features.length === 0) return;

            const coordinates = (
              e.features[0].geometry as { coordinates: [number, number] }
            ).coordinates.slice();
            const properties = e.features[0].properties;

            // Detect dark mode
            const isDark = document.documentElement.classList.contains("dark");

            // Create popup content for emergency contacts
            const isAtShelter = properties?.status === "at_shelter";
            const statusBadge = isAtShelter
              ? `<span class="contact-status-badge at-shelter">在避難所</span>`
              : `<span class="contact-status-badge outside">在外</span>`;

            const locationInfo = isAtShelter
              ? `
                <div class="contact-popup-row">
                  <span class="contact-popup-label">避難所:</span>
                  <span class="contact-popup-value">${properties?.shelterName || "N/A"}</span>
                </div>
                <div class="contact-popup-row">
                  <span class="contact-popup-label">地址:</span>
                  <span class="contact-popup-value">${properties?.shelterAddress || "N/A"}</span>
                </div>
              `
              : `
                <div class="contact-popup-row">
                  <span class="contact-popup-label">位置:</span>
                  <span class="contact-popup-value">座標: ${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}</span>
                </div>
              `;

            const popupContent = `
            <div class="contact-popup">
              <div class="contact-popup-header">
                <h3 class="contact-popup-title">${properties?.name || "N/A"}</h3>
                ${statusBadge}
              </div>
              <div class="contact-popup-content">
                <div class="contact-popup-row">
                  <span class="contact-popup-label">關係:</span>
                  <span class="contact-popup-value">${properties?.relation || "N/A"}</span>
                </div>
                <div class="contact-popup-row">
                  <span class="contact-popup-label">電話:</span>
                  <span class="contact-popup-value">${properties?.phone || "N/A"}</span>
                </div>
                ${locationInfo}
              </div>
            </div>
          `;

            new mapboxgl.Popup({
              maxWidth: "320px",
              className: `contact-popup-container ${isDark ? "dark" : ""}`,
            })
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(map.current);
          });

          // Change cursor on hover for emergency contacts
          map.current.on("mouseenter", "emergency-contacts", () => {
            if (map.current) map.current.getCanvas().style.cursor = "pointer";
          });
          map.current.on("mouseleave", "emergency-contacts", () => {
            if (map.current) map.current.getCanvas().style.cursor = "";
          });
        };

        // Initial load of contacts
        await loadContactsLayer(familyData.members);

        setIsLoading(false);
        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading shelter data:", error);
        setIsLoading(false);
      }
    });
  }, [familyData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update common shelter filter and fly to it when it changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const commonShelterAddress = familyData.commonShelter?.address || "__NONE__";

    // Update filters for regular shelter layer
    if (map.current.getLayer("unclustered-point")) {
      map.current.setFilter("unclustered-point", [
        "all",
        ["!", ["has", "point_count"]],
        ["!=", ["get", "地址"], commonShelterAddress],
      ]);
    }

    // Update filters for common shelter layers
    if (map.current.getLayer("common-shelter-point")) {
      map.current.setFilter("common-shelter-point", [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "地址"], commonShelterAddress],
      ]);
    }

    if (map.current.getLayer("common-shelter-pulse")) {
      map.current.setFilter("common-shelter-pulse", [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "地址"], commonShelterAddress],
      ]);
    }

    // Fly to common shelter if it exists
    if (familyData.commonShelter?.coordinates) {
      map.current.flyTo({
        center: familyData.commonShelter.coordinates,
        zoom: 16,
        duration: 1500,
        essential: true,
      });
    }
  }, [familyData.commonShelter, mapLoaded]);

  // Update family members when they change - NO RE-RENDER
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const updateContacts = async () => {
      // This is a simplified version - you might want to implement the full loadContactsLayer logic here
      // For now, we'll just log that members changed
      console.log("Family members updated:", familyData.members);
      // TODO: Implement proper contact layer update without full reload
    };

    updateContacts();
  }, [familyData.members, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/75 backdrop-blur-sm">
          <div className="text-muted-foreground font-medium">
            正在載入地圖...
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Light mode colors */
        .shelter-popup-container .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.625rem;
          background-color: #ffffff;
          color: #171b1d;
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1);
          border: 1px solid #e3e7e9;
        }

        .shelter-popup-container .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }

        .shelter-popup-container .mapboxgl-popup-close-button {
          color: #5e6d76;
          font-size: 20px;
          padding: 8px;
          right: 4px;
          top: 4px;
          transition: color 0.2s;
        }

        .shelter-popup-container .mapboxgl-popup-close-button:hover {
          color: #171b1d;
          background-color: transparent;
        }

        /* Dark mode colors */
        .shelter-popup-container.dark .mapboxgl-popup-content {
          background-color: #30383d;
          color: #ffffff;
          border: 1px solid #30383d;
        }

        .shelter-popup-container.dark .mapboxgl-popup-tip {
          border-top-color: #30383d;
        }

        .shelter-popup-container.dark .mapboxgl-popup-close-button {
          color: #cad1d5;
        }

        .shelter-popup-container.dark .mapboxgl-popup-close-button:hover {
          color: #ffffff;
        }

        .shelter-popup {
          padding: 16px;
          min-width: 240px;
        }

        .shelter-popup-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #5ab4c5;
          border-bottom: 2px solid #5ab4c5;
          padding-bottom: 8px;
        }

        .shelter-popup-container.dark .shelter-popup-title {
          color: #71c5d5;
          border-bottom-color: #71c5d5;
        }

        .shelter-popup-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shelter-popup-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .shelter-popup-label {
          font-weight: 600;
          color: #5e6d76;
          white-space: nowrap;
        }

        .shelter-popup-container.dark .shelter-popup-label {
          color: #cad1d5;
        }

        .shelter-popup-value {
          color: #171b1d;
          flex: 1;
        }

        .shelter-popup-container.dark .shelter-popup-value {
          color: #ffffff;
        }

        /* Emergency Contact Popup Styles */
        .contact-popup-container .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.625rem;
          background-color: #ffffff;
          color: #171b1d;
          box-shadow:
            0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1);
          border: 1px solid #e3e7e9;
        }

        .contact-popup-container .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }

        .contact-popup-container .mapboxgl-popup-close-button {
          color: #5e6d76;
          font-size: 20px;
          padding: 8px;
          right: 4px;
          top: 4px;
          transition: color 0.2s;
        }

        .contact-popup-container .mapboxgl-popup-close-button:hover {
          color: #171b1d;
          background-color: transparent;
        }

        .contact-popup-container.dark .mapboxgl-popup-content {
          background-color: #30383d;
          color: #ffffff;
          border: 1px solid #30383d;
        }

        .contact-popup-container.dark .mapboxgl-popup-tip {
          border-top-color: #30383d;
        }

        .contact-popup-container.dark .mapboxgl-popup-close-button {
          color: #cad1d5;
        }

        .contact-popup-container.dark .mapboxgl-popup-close-button:hover {
          color: #ffffff;
        }

        .contact-popup {
          padding: 16px;
          min-width: 280px;
        }

        .contact-popup-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          padding-right: 32px;
          border-bottom: 2px solid #fd853a;
        }

        .contact-popup-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #fd853a;
          min-width: 0;
        }

        .contact-popup-container.dark .contact-popup-title {
          color: #fe9d5d;
        }

        .contact-status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 9999px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .contact-status-badge.at-shelter {
          background-color: #5ab4c5;
          color: #ffffff;
        }

        .contact-popup-container.dark .contact-status-badge.at-shelter {
          background-color: #71c5d5;
          color: #171b1d;
        }

        .contact-status-badge.outside {
          background-color: #f5ba4b;
          color: #171b1d;
        }

        .contact-popup-container.dark .contact-status-badge.outside {
          background-color: #f7c968;
          color: #171b1d;
        }

        .contact-popup-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-popup-row {
          display: flex;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .contact-popup-label {
          font-weight: 600;
          color: #5e6d76;
          white-space: nowrap;
        }

        .contact-popup-container.dark .contact-popup-label {
          color: #cad1d5;
        }

        .contact-popup-value {
          color: #171b1d;
          flex: 1;
        }

        .contact-popup-container.dark .contact-popup-value {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
});

ShelterMap.displayName = "ShelterMap";

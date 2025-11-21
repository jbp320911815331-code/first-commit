import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { GeoLocation, RadioStation } from '../types';

interface GlobeProps {
  onLocationChange: (location: GeoLocation) => void;
  stations: RadioStation[];
  activeStation: RadioStation | null;
}

const Globe: React.FC<GlobeProps> = ({ onLocationChange, stations, activeStation }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [worldData, setWorldData] = useState<any>(null);

  // Load world topology
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        setWorldData(feature(topology, topology.objects.countries));
      });
  }, []);

  // Sync rotation to active station if it changes externally
  useEffect(() => {
    if (activeStation && activeStation.geo_long && activeStation.geo_lat) {
      // Rotate globe to center the station
      // D3 Rotation is [-lng, -lat]
      const targetRotation: [number, number, number] = [-activeStation.geo_long, -activeStation.geo_lat, 0];
      
      const interpolate = d3.interpolate(rotation, targetRotation);
      let duration = 1000;
      let start = performance.now();

      const animate = (time: number) => {
        let t = Math.min(1, (time - start) / duration);
        setRotation(interpolate(t) as [number, number, number]);
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStation]);

  const updateLocation = useCallback(() => {
     // Calculate center coord from rotation
     const centerLng = -rotation[0];
     const centerLat = -rotation[1];
     onLocationChange({ lat: centerLat, lng: centerLng });
  }, [rotation, onLocationChange]);

  // Debounced location update on drag end
  useEffect(() => {
      const timeout = setTimeout(() => {
          updateLocation();
      }, 500);
      return () => clearTimeout(timeout);
  }, [rotation, updateLocation]);


  useEffect(() => {
    if (!worldData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const sensitivity = 75;

    const projection = d3.geoOrthographic()
      .scale(Math.min(width, height) / 2.2)
      .center([0, 0])
      .rotate(rotation)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current);

    // Clear previous renders
    svg.selectAll('*').remove();

    // 1. Globe Background (Ocean)
    svg.append('circle')
      .attr('fill', '#0f172a') // Slate-900
      .attr('stroke', '#22c55e') // Green-500
      .attr('stroke-width', 2)
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale());

    // 2. Graticule (Grid lines)
    const graticule = d3.geoGraticule();
    svg.append('path')
      .datum(graticule())
      .attr('class', 'graticule')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b') // Slate-800
      .attr('stroke-width', 0.5);

    // 3. Countries
    svg.append('g')
      .selectAll('path')
      .data(worldData.features)
      .enter().append('path')
      .attr('d', path as any)
      .attr('fill', '#1e293b') // Slate-800
      .attr('stroke', '#334155') // Slate-700
      .attr('stroke-width', 0.5)
      .style('opacity', 0.8);

    // 4. Stations (Points)
    // Filter visible points (simple visibility check)
    // A point is visible if the distance from the center is less than 90 degrees.
    // However, d3 geoPath handles clipping for Orthographic automatically usually,
    // but explicit filtering helps performance and visual glitches.
    
    svg.append('g')
      .selectAll('circle')
      .data(stations)
      .enter().append('circle')
      .attr('cx', d => projection([d.geo_long!, d.geo_lat!])?.[0] || 0)
      .attr('cy', d => projection([d.geo_long!, d.geo_lat!])?.[1] || 0)
      .attr('r', d => (activeStation?.stationuuid === d.stationuuid ? 6 : 3))
      .attr('fill', d => (activeStation?.stationuuid === d.stationuuid ? '#ffffff' : '#22c55e'))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .style('display', d => {
          const coords = [d.geo_long, d.geo_lat];
          // Simple visibility check based on clip angle (90 deg)
          const g = d3.geoCircle().center(coords as any).radius(0.1)();
          return path(g) ? 'block' : 'none';
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
         // Although we click on the list usually, clicking a dot could select it
         // Implementing this would require passing a setSelectedStation prop back up
      });


    // Drag Behavior
    const drag = d3.drag<SVGSVGElement, unknown>()
      .subject(() => {
        const r = projection.rotate();
        return { x: r[0] / sensitivity, y: -r[1] / sensitivity };
      })
      .on('drag', (event) => {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();
        const newRotation: [number, number, number] = [
          rotation[0] + event.dx * k * 2, // Faster X rotation
          rotation[1] - event.dy * k * 2,
          rotation[2]
        ];
        
        // Clamp latitude to avoid flipping
        newRotation[1] = Math.max(-90, Math.min(90, newRotation[1]));
        
        setRotation(newRotation);
      });

    svg.call(drag);

  }, [worldData, rotation, stations, activeStation]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-tighter">RADIO<span className="text-green-500">.AI</span></h1>
        <p className="text-xs text-green-400 font-mono mt-1">
            LAT: {(-rotation[1]).toFixed(2)} LON: {(-rotation[0]).toFixed(2)}
        </p>
      </div>
      
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      
      {/* Decorative Crosshairs */}
      <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 border border-green-500/30 rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full -ml-0.5 -mt-0.5 pointer-events-none z-0" />
    </div>
  );
};

export default Globe;

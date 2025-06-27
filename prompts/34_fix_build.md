Fix all build error:
src/entities/bosses/TankZombie.ts(476,20): error TS2339: Property 'emissiveIntensity' does not exist on type 'MeshBasicMaterial'.
src/entities/enemies/CamoZombie.ts(99,20): error TS2339: Property 'emissiveIntensity' does not exist on type 'MeshBasicMaterial'.
src/levels/mechanics/IndustrialHazards.ts(78,7): error TS2353: Object literal may only specify known properties, and 'emissive' does not exist in type 'MeshBasicMaterialParameters'.
src/levels/mechanics/IndustrialHazards.ts(144,51): error TS2339: Property 'emissiveIntensity' does not exist on type 'MeshBasicMaterial'.
src/levels/mechanics/IndustrialHazards.ts(159,51): error TS2339: Property 'emissiveIntensity' does not exist on type 'MeshBasicMaterial'.
Error: Command "npm run build" exited with 2
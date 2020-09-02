export const getDistance = (a, b) => {
  const [ax, az, ay] = a;
  const [bx, bz, by] = b;
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) + Math.pow(az - bz, 2));
};

export const convertCoordinates = (coord) => {
  const {x, y, z} = coord;
  return [x, z, y];
};
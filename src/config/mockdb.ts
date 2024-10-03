const mockSequelize = {
    authenticate: jest.fn(),
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  };
  
  export const connectDb = jest.fn();
  export default mockSequelize;
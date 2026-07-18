import middleware from "next-auth/middleware";

export const proxy = middleware;
export default middleware;

export const config = {
    matcher: ["/sacco-admin(.*)", "/member(.*)"],
};

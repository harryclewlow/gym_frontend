import Vue from "vue";
import VueRouter from "vue-router";
import MemberForm from "../components/MemberForm";
import Error from "../components/Error";
import PaymentGateway from "../components/PaymentGateway";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "MemberForm",
    component: MemberForm
  },
  {
    path: "/error",
    name: "ErrorPage",
    component: Error,
    props: true
  },
  {
    path: "/payment",
    name: "PaymentGateway",
    component: PaymentGateway,
    props: true,
    beforeEnter: (to, from, next) => {
      if (to.params.membership) {
        next(); // <-- everything good, proceed
      } else {
        next({ name: 'MemberForm' }); // <-- redirect to setup
      }
    }
  },
  {
    path: "*",
    name: "NotFound",
    component: Error,
    props: { errorCode: "404" }
  }

];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;

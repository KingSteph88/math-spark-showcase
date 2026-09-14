import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type Plan = {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
};

function RegisterPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    planId: "",
  });

  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {

  async function fetchPlans() {

    try {

      const res = await fetch(
        "http://localhost:5000/plans"
      );


      console.log("STATUS:", res.status);


      const data = await res.json();


      console.log("PLANS:", data);


      setPlans(data);


    } catch(error) {

      console.log(error);

      setError("Unable to load subscription plans.");

    }
    finally {

      setPlansLoading(false);

    }
  }


  fetchPlans();

}, []);



  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }



  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:5000/auth/register",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify(form),
        }
      );


      const data = await response.json();


      if(!response.ok){
        throw new Error(
          data.error || "Registration failed"
        );
      }


      setSuccess(
        "Account created! Check your email to verify your account."
      );


      setTimeout(()=>{
        navigate({
          to:"/login",
        });
      },2500);



    }catch(err:any){

      setError(
        err.message ||
        "Something went wrong"
      );

    }finally{

      setLoading(false);

    }

  }



  return (

    <div className="
      min-h-screen
      bg-hero-aura
      px-6
      flex
      items-center
      justify-center
    ">


      <div className="
        w-full
        max-w-lg
        glass-card
        rounded-[2rem]
        p-8
        shadow-glow
      ">


        {/* Logo */}

        <div className="flex justify-center mb-6">

          <div className="
            size-14
            rounded-2xl
            bg-warm-gradient
            grid
            place-items-center
            text-white
          ">

            <GraduationCap size={28}/>

          </div>

        </div>



        <div className="text-center">

          <h1 className="
            text-4xl
            font-bold
            tracking-tight
          ">
            Create Account
          </h1>


          <p className="
            mt-3
            text-muted-foreground
          ">
            Start your Mathéa learning journey
          </p>


        </div>




        {error && (

          <div className="
            mt-6
            rounded-2xl
            bg-red-100
            text-red-700
            p-4
            text-sm
          ">
            {error}
          </div>

        )}



        {success && (

          <div className="
            mt-6
            rounded-2xl
            bg-green-100
            text-green-700
            p-4
            text-sm
          ">
            {success}
          </div>

        )}






        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >


          <div className="grid grid-cols-2 gap-3">


            <input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="input"
            />


            <input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="input"
            />

          </div>




          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="input"
          />




          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
            className="input"
          />





          <div>

            <label className="
              text-sm
              font-medium
              mb-2
              block
            ">
              Choose your pack
            </label>



            <select
              name="planId"
              value={form.planId}
              onChange={handleChange}
              required
              className="input"
            >


              <option value="">
                Select a plan
              </option>


              {
                plansLoading ?

                <option>
                  Loading plans...
                </option>

                :

                plans.map(plan=>(

                  <option
                    key={plan._id}
                    value={plan._id}
                  >
                    {plan.name} — {plan.price} TND
                  </option>

                ))

              }


            </select>

          </div>





          <button
            disabled={loading}
            className="
              w-full
              rounded-full
              bg-warm-gradient
              text-white
              py-3.5
              font-medium
              shadow-glow
              hover:opacity-95
              transition
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-50
            "
          >

            {
              loading && (
                <Loader2
                  className="animate-spin"
                  size={20}
                />
              )
            }


            Create Account


            <ArrowRight size={18}/>

          </button>


        </form>





        <p className="
          text-center
          text-sm
          text-muted-foreground
          mt-8
        ">

          Already have an account?


          <Link
            to="/login"
            className="
              ml-2
              text-coral
              font-medium
            "
          >
            Login
          </Link>


        </p>



        <div className="
          mt-6
          flex
          justify-center
          gap-2
          text-xs
          text-muted-foreground
        ">

          <Sparkles size={14}/>

          Learn smarter with Mathéa

        </div>


      </div>


    </div>

  );
}
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  GraduationCap,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";

import { api, saveSession } from "@/lib/api";


export const Route = createFileRoute("/login")({
  component: LoginPage,
});


function LoginPage() {

  const navigate = useNavigate();


  const [form,setForm] = useState({
    email:"",
    password:"",
  });


  const [loading,setLoading] = useState(false);

  const [error,setError] = useState("");

  const [success,setSuccess] = useState("");



  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ){

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }




  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ){

    e.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);


    try {


      /*
        One login for the whole platform. The backend looks the address
        up in the teacher collection first and tells us which kind of
        account it is, so there is no separate teacher login any more.
      */

      const { data } = await api.post(
        "/auth/login",
        form
      );


      saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accountType: data.accountType,
        user: data.user,
      });


      const isTeacher =
        data.accountType === "teacher";


      setSuccess(
        isTeacher
          ? "Login successful. Opening Teacher Studio…"
          : "Login successful. Welcome back!"
      );


      setTimeout(()=>{

        navigate({
          to: isTeacher ? "/teacher" : "/student",
        });

      },900);



    }catch(err:any){


      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong"
      );


    }finally{

      setLoading(false);

    }

  }





  return (

    <div
      className="
      min-h-screen
      bg-hero-aura
      px-6
      flex
      items-center
      justify-center
      "
    >


      <div
        className="
        w-full
        max-w-lg
        glass-card
        rounded-[2rem]
        p-8
        shadow-glow
        "
      >



        {/* Logo */}

        <div className="flex justify-center mb-6">


          <div
            className="
            size-14
            rounded-2xl
            bg-warm-gradient
            grid
            place-items-center
            text-white
            "
          >

            <GraduationCap size={28}/>


          </div>


        </div>





        <div className="text-center">


          <h1
            className="
            text-4xl
            font-bold
            tracking-tight
            "
          >

            Welcome Back


          </h1>



          <p
            className="
            mt-3
            text-muted-foreground
            "
          >

            Continue your Mathéa learning journey


          </p>



        </div>






        {
          error && (

            <div
              className="
              mt-6
              rounded-2xl
              bg-red-100
              text-red-700
              p-4
              text-sm
              "
            >

              {error}

            </div>

          )
        }






        {
          success && (

            <div
              className="
              mt-6
              rounded-2xl
              bg-green-100
              text-green-700
              p-4
              text-sm
              "
            >

              {success}

            </div>

          )
        }





        <form
          onSubmit={handleSubmit}
          className="
          mt-8
          space-y-4
          "
        >





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

            placeholder="Password"

            value={form.password}

            onChange={handleChange}

            required

            className="input"

          />







          <div className="text-right">


            <Link
              to="/forgot-password"
              className="
              text-sm
              text-coral
              font-medium
              "
            >

              Forgot password?


            </Link>


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
                  size={20}
                  className="animate-spin"
                />

              )
            }



            Login



            <ArrowRight size={18}/>



          </button>





        </form>









        <p
          className="
          text-center
          text-sm
          text-muted-foreground
          mt-8
          "
        >

          Don't have an account?


          <Link

            to="/register"

            className="
            ml-2
            text-coral
            font-medium
            "

          >

            Create account

          </Link>



        </p>







        <div
          className="
          mt-6
          flex
          justify-center
          gap-2
          text-xs
          text-muted-foreground
          "
        >

          <Sparkles size={14}/>


          Learn smarter with Mathéa


        </div>






      </div>


    </div>

  );

}
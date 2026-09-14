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


      const response = await fetch(
        "http://localhost:5000/auth/login",
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
          data.message ||
          data.error ||
          "Login failed"
        );

      }



      /*
        Store authentication data
      */

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );


      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );


      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );



      setSuccess(
        "Login successful. Welcome back!"
      );



      setTimeout(()=>{

        navigate({
          to:"/student",
        });

      },1200);



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
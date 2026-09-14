import {
  createFileRoute
} from "@tanstack/react-router";

import {
  BookOpen,
  Radio,
  FileText,
  TrendingUp,
  Loader2
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import { api } from "@/lib/api";


export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});


type DashboardData = {

 user:{
  firstName:string;
  lastName:string;
 };

 stats:{
  overallProgress:number;
  completedLessons:number;
  activeChapters:number;
  activeCourses:number;
 };

 continueLearning?:{
  courseTitle:string;
  chapterTitle:string;
  lessonTitle:string;
  progress:number;
 };

 recentCourses:Array<{
  title:string;
  progress:number;
 }>;

};



function StudentDashboard(){

const [
 dashboard,
 setDashboard
] = useState<DashboardData|null>(null);


const [
 loading,
 setLoading
] = useState(true);



useEffect(()=>{

 async function loadDashboard(){

  try{

   const res =
    await api.get(
      "/student/dashboard"
    );

   setDashboard(res.data);


  }catch(error){

   console.error(error);

  }
  finally{
    setLoading(false);
  }

 }


 loadDashboard();

},[]);



if(loading){

 return (
  <div className="flex justify-center p-10">
   <Loader2 className="animate-spin"/>
  </div>
 );

}



if(!dashboard){

 return (
  <div>
   Failed loading dashboard
  </div>
 );

}



return (

<div className="space-y-6">


{/* Welcome */}

<div className="glass-card rounded-2xl p-6">


<div className="text-sm text-muted-foreground">
 Continue learning
</div>


<h1 className="text-3xl font-display font-bold mt-2">

 Welcome back, {dashboard.user.firstName}

</h1>


<p className="mt-2 text-muted-foreground">

You're doing great. Keep going.

</p>


</div>



{/* Stats */}

<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">


{[

{
icon:BookOpen,
label:"Completed lessons",
value:
dashboard.stats.completedLessons
},


{
icon:TrendingUp,
label:"Progress",
value:
`${dashboard.stats.overallProgress}%`
},


{
icon:Radio,
label:"Active courses",
value:
dashboard.stats.activeCourses
},


{
icon:FileText,
label:"Active chapters",
value:
dashboard.stats.activeChapters
}

].map((s)=>{


const Icon=s.icon;


return (

<div
key={s.label}
className="glass-card rounded-2xl p-5"
>


<div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white mb-3">

<Icon className="size-4"/>

</div>


<div className="text-2xl font-bold">

{s.value}

</div>


<div className="text-sm text-muted-foreground">

{s.label}

</div>


</div>

);


})}


</div>



{/* Continue Learning */}

{
dashboard.continueLearning &&

<div className="glass-card rounded-2xl p-6">


<div className="text-xs text-coral uppercase">

{
dashboard.continueLearning.courseTitle
}

</div>


<h2 className="text-xl font-bold mt-2">

{
dashboard.continueLearning.lessonTitle
}

</h2>


<div className="mt-4 h-2 bg-secondary rounded-full">

<div

className="h-full bg-warm-gradient rounded-full"

style={{
width:
`${dashboard.continueLearning.progress}%`
}}

/>


</div>


<p className="text-sm mt-2">

{
dashboard.continueLearning.progress
}% complete

</p>


</div>

}


</div>

);

}
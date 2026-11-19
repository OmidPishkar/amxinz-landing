import { getDb } from "@/lib/mongodb";
import type { RoundDoc } from "@/lib/types";
import { SKILLS } from "@/lib/skills";
function summarize(rows:{played:number;correct:number}[]){const played=rows[0]?.played??0;const correct=rows[0]?.correct??0;return{played,correct,accuracy:played?Math.round(correct/played*1000)/10:null};}
export async function getWeeklyReport(userId:string){
 const db=await getDb();const now=new Date();const currentFrom=new Date(now.getTime()-7*86400000);const previousFrom=new Date(now.getTime()-14*86400000);const rounds=db.collection<RoundDoc>("rounds");
 const [currentRows,previousRows,currentSkills,previousSkills,dailyNow,dailyOld,personalNow,personalOld,riskNow,riskOld]=await Promise.all([
  rounds.aggregate([{$match:{userId,answered:true,answeredAt:{$gte:currentFrom,$lte:now}}},{$group:{_id:null,played:{$sum:1},correct:{$sum:{$cond:["$correct",1,0]}}}}]).toArray(),
  rounds.aggregate([{$match:{userId,answered:true,answeredAt:{$gte:previousFrom,$lt:currentFrom}}},{$group:{_id:null,played:{$sum:1},correct:{$sum:{$cond:["$correct",1,0]}}}}]).toArray(),
  db.collection("skill_events").find({userId,createdAt:{$gte:currentFrom,$lte:now}}).toArray(),
  db.collection("skill_events").find({userId,createdAt:{$gte:previousFrom,$lt:currentFrom}}).toArray(),
  db.collection("daily_mission_entries").countDocuments({userId,answeredAt:{$gte:currentFrom,$lte:now}}),
  db.collection("daily_mission_entries").countDocuments({userId,answeredAt:{$gte:previousFrom,$lt:currentFrom}}),
  db.collection("personal_mission_entries").countDocuments({userId,answeredAt:{$gte:currentFrom,$lte:now}}),
  db.collection("personal_mission_entries").countDocuments({userId,answeredAt:{$gte:previousFrom,$lt:currentFrom}}),
  db.collection("risk_lab_sessions").countDocuments({userId,status:"completed","answer.answeredAt":{$gte:currentFrom,$lte:now}}),
  db.collection("risk_lab_sessions").countDocuments({userId,status:"completed","answer.answeredAt":{$gte:previousFrom,$lt:currentFrom}}),
 ]);
 const current=summarize(currentRows as {played:number;correct:number}[]);const previous=summarize(previousRows as {played:number;correct:number}[]);
 const skills=SKILLS.map(skill=>{const nowRows=currentSkills.filter(r=>r.skill===skill.id);const oldRows=previousSkills.filter(r=>r.skill===skill.id);const accuracy=nowRows.length?Math.round(nowRows.filter(r=>r.correct).length/nowRows.length*100):null;const previousAccuracy=oldRows.length?Math.round(oldRows.filter(r=>r.correct).length/oldRows.length*100):null;return{id:skill.id,name:skill.name,description:skill.description,samples:nowRows.length,accuracy,previousAccuracy,change:accuracy!==null&&previousAccuracy!==null?accuracy-previousAccuracy:null};});
 return{generatedAt:now,periodStart:currentFrom,periodEnd:now,current,previous,skills,activity:{dailyMission:{current:dailyNow,previous:dailyOld},personalMission:{current:personalNow,previous:personalOld},riskLab:{current:riskNow,previous:riskOld}}};
}

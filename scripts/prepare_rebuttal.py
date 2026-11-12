"""Prepare public evidence assets. Usage: --paper PATH --resistance PATH --vision PATH."""
import argparse,csv,json,shutil,subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import pymupdf
p=argparse.ArgumentParser();p.add_argument('--paper',type=Path,required=True);p.add_argument('--resistance',type=Path,required=True);p.add_argument('--vision',type=Path,required=True);p.add_argument('--pdf',type=Path,required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1];out=root/'assets/rebuttal'
tasks=['close_laptop','open_fridge','pull_curtain','close_drawer']
def run(cmd): subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
for name in ['subtask_results','demonstration_budget_results','visual_ablation_results','failure_causes']:
 d=json.loads((a.paper/'figures/rebuttal'/f'{name}.json').read_text())
 if 'fields' in d: d['fields']=['S1_percent','S2_percent','S3_percent','score_percent','sd_percentage_points']
 d.pop('evaluation_batches',None);d.pop('trials_per_batch',None)
 (out/'data'/f'{name}.json').write_text(json.dumps(d,indent=2)+'\n')
for src,dst in [('tasks_rebuttal.pdf','human-scaling'),('efficiency_rebuttal.pdf','human-robot'),('failure_stage_sankey.pdf','failures')]:
 pdf=pymupdf.open(a.paper/'figures'/src);page=pdf[0]
 page.get_pixmap(matrix=pymupdf.Matrix(2,2)).save(out/'figures'/f'{dst}.png')
 shutil.copyfile(a.paper/'figures'/src,out/'figures'/f'{dst}.pdf')
# Export the exact implementation-settings table, with its paper context.
pdf=pymupdf.open(a.pdf)
for page in pdf:
 if 'Regularization' in page.get_text() and '0.015' in page.get_text():
  page.get_pixmap(matrix=pymupdf.Matrix(1.7,1.7)).save(out/'figures/optimization.png');break
shutil.copyfile(a.pdf,out/'revised-paper.pdf')
rows=list(csv.DictReader((a.resistance/'summary.csv').open()))
(out/'data/resistance.json').write_text(json.dumps([{k:((float(v) if v else None) if k in ['force_n','position_error_cm','orientation_error_deg','position_error_increase_vs_0N_cm'] else v) for k,v in row.items() if k in ['task','force_n','position_error_cm','orientation_error_deg','position_error_increase_vs_0N_cm']} for row in rows],indent=2)+'\n')
shutil.copyfile(a.resistance/'summary.csv',out/'data/resistance.csv')
for task in tasks:
 (out/'videos/resistance'/task).mkdir(exist_ok=True)
 for n in range(21):
  shutil.copyfile(a.resistance/task/f'{n:02}N/replay.mp4',out/'videos/resistance'/task/f'{n:02}.mp4')
  run(['ffmpeg','-v','error','-ss','1','-i',str(out/'videos/resistance'/task/f'{n:02}.mp4'),'-frames:v','1','-y',str(out/'posters'/f'resistance-{task}-{n:02}.jpg')])
 run(['ffmpeg','-v','error','-ss','1','-i',str(out/'videos/resistance'/task/'00.mp4'),'-frames:v','1','-y',str(out/'posters'/f'resistance-{task}.jpg')])
def vision(job):
 task,condition=job;src=a.vision/'半开环仿真replay视频'/task/f'{condition}.mp4';dst=out/'videos/vision'/task/f'{condition}.mp4';dst.parent.mkdir(exist_ok=True)
 # Hide internal error diagnostics, retaining the full motion and actual visual input.
 run(['ffmpeg','-v','error','-i',str(src),'-vf','drawbox=x=640:y=340:w=320:h=200:color=0x191919:t=fill','-an','-c:v','libx264','-crf','22','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2','-y',str(dst)])
 run(['ffmpeg','-v','error','-ss','1','-i',str(dst),'-frames:v','1','-y',str(out/'posters'/f'vision-{task}-{condition}.jpg')])
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(vision,[(t,c) for t in tasks for c in ['video','first_frame','black','noise','white']]))
print('Prepared 84 resistance videos, 20 visual-condition videos, figures and data.')

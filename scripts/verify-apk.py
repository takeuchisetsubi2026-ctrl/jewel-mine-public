"""Fail the build if Android, footer, source or signing identity disagree."""
import hashlib,json,os,pathlib,re,shutil,subprocess,zipfile
root=pathlib.Path(__file__).resolve().parent.parent
m=json.loads((root/'build/identity.json').read_text())
apk=root/'android/app/build/outputs/apk/debug/app-debug.apk'
tools=pathlib.Path(os.environ.get('ANDROID_HOME',os.environ.get('ANDROID_SDK_ROOT','')))/'build-tools/36.0.0'
badging=subprocess.check_output([str(tools/'aapt'),'dump','badging',str(apk)],text=True)
for token in [f"name='{m['applicationId']}'",f"versionCode='{m['versionCode']}'",f"versionName='{m['versionName']}'",f"application-label:'{m['appName']}'"]:
    assert token in badging,token
cert=subprocess.check_output([str(tools/'apksigner'),'verify','--print-certs',str(apk)],text=True)
assert 'Signer #1 certificate SHA-256 digest: '+m['certificateSha256'] in cert
assert hashlib.sha256((root/'index.html').read_bytes()).hexdigest()==m['sourceSha256']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==m['gitSha']
with zipfile.ZipFile(apk) as z:
    html=z.read('assets/public/index.html')
    assert html==(root/'www/index.html').read_bytes()
    assert json.loads(z.read('assets/public/build-info.json'))==m
    embedded=json.loads(re.search(rb'<script type="application/json" id="buildMetadata">(.*?)</script>',html).group(1))
    assert embedded==m
    footer=re.search(rb'id="buildIdentity"[^>]*>(.*?)</div>',html).group(1).decode()
    assert footer==f"{m['testLabel']}｜v{m['versionName']}｜{m['gitSha'][:7]}"+(' DIRTY' if m['dirty'] else '')
dist=root/'dist';dist.mkdir(exist_ok=True)
shutil.copy2(apk,dist/m['apkFileName'])
m['apkSha256']=hashlib.sha256(apk.read_bytes()).hexdigest()
(dist/'build-info.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(dist/'SHA256SUMS.txt').write_text(m['apkSha256']+'  '+m['apkFileName']+'\n')
print('APK label, versionCode/name, full SHA, packaged assets and existing test certificate: PASS')

const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const dir=path.join(__dirname,'fixtures');fs.mkdirSync(dir,{recursive:true});
function crc(data){let c=0xffffffff;for(const byte of data){c^=byte;for(let n=0;n<8;n++)c=(c>>>1)^(c&1?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(name,data){const type=Buffer.from(name),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([len,type,data,sum])}
function png(name,pixel){const w=600,h=800,raw=Buffer.alloc((w*3+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const color=pixel(x,y),i=y*(w*3+1)+1+x*3;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2]}const hdr=Buffer.alloc(13);hdr.writeUInt32BE(w);hdr.writeUInt32BE(h,4);hdr[8]=8;hdr[9]=2;fs.writeFileSync(path.join(dir,name),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]))}
png('sample-main.png',(x,y)=>{if(Math.abs(x-y*.6-10)<5)return[194,110,69];if(Math.hypot(x-120,y-650)<180)return[109,136,87];if(Math.hypot(x-560,y-130)<220)return[183,199,159];return[243,237,218]});
png('sample-flap.png',(x,y)=>(Math.floor(x/45)+Math.floor(y/45))%2?[181,102,63]:[229,195,153]);
console.log(dir);

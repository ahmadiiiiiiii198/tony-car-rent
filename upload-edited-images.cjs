const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xrfmsuoqkzkyhnvmgehv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZm1zdW9xa3preWhudm1nZWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzcxNTEsImV4cCI6MjA4NjMxMzE1MX0.-Hl-5J-Pq-CmJdzUefDZptEp-5zzprtQF7dJtAZuJ94';

const supabase = createClient(supabaseUrl, supabaseKey);

const editedDir = 'C:\\Users\\39351\\Downloads\\Windsurf\\car_bg_edit\\edited';

const carImages = [
  // Range Rover Evoque (id=17)
  { file: 'Range-Rover-Evoque-1-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-1.png' },
  { file: 'Range-Rover-Evoque-2-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-2.png' },
  { file: 'Range-Rover-Evoque-3-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-3.png' },
  { file: 'Range-Rover-Evoque-4-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-4.png' },
  { file: 'Range-Rover-Evoque-5-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-5.png' },
  { file: 'Range-Rover-Evoque-6-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-6.png' },
  { file: 'Range-Rover-Evoque-7-edited.png', storagePath: 'range-rover-evoque/Range-Rover-Evoque-7.png' },
  // VW Polo (id=18)
  { file: 'VW-Polo-1-edited.png', storagePath: 'vw-polo/VW-Polo-1.png' },
  { file: 'VW-Polo-2-edited.png', storagePath: 'vw-polo/VW-Polo-2.png' },
  { file: 'VW-Polo-3-edited.png', storagePath: 'vw-polo/VW-Polo-3.png' },
  { file: 'VW-Polo-4-edited.png', storagePath: 'vw-polo/VW-Polo-4.png' },
];

async function uploadEditedImages() {
  console.log('Uploading edited images to Supabase storage...\n');

  const evoqueUrls = [];
  const poloUrls = [];

  for (const img of carImages) {
    const filepath = path.join(editedDir, img.file);
    if (!fs.existsSync(filepath)) {
      console.log(`SKIP: ${img.file} not found`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filepath);

    // First remove old file if exists (jpg version)
    const oldJpgPath = img.storagePath.replace('.png', '.jpg');
    await supabase.storage.from('car-images').remove([oldJpgPath]);

    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(img.storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.log(`ERROR ${img.file}: ${error.message}`);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/car-images/${img.storagePath}`;
      console.log(`OK: ${img.file}`);

      if (img.storagePath.startsWith('range-rover-evoque/')) {
        evoqueUrls.push(publicUrl);
      } else if (img.storagePath.startsWith('vw-polo/')) {
        poloUrls.push(publicUrl);
      }
    }
  }

  // Update Range Rover Evoque in DB
  if (evoqueUrls.length > 0) {
    const { error } = await supabase
      .from('cars')
      .update({ image: evoqueUrls[0], images: evoqueUrls })
      .eq('id', 17);
    console.log(error ? `DB ERROR Evoque: ${error.message}` : `\nDB UPDATED: Range Rover Evoque with ${evoqueUrls.length} edited images`);
  }

  // Update VW Polo in DB
  if (poloUrls.length > 0) {
    const { error } = await supabase
      .from('cars')
      .update({ image: poloUrls[0], images: poloUrls })
      .eq('id', 18);
    console.log(error ? `DB ERROR Polo: ${error.message}` : `DB UPDATED: VW Polo with ${poloUrls.length} edited images`);
  }

  console.log('\nDone!');
}

uploadEditedImages().catch(console.error);

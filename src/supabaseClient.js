import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://cgwqxikuryxmmkwgvewb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd3F4aWt1cnl4bW1rd2d2ZXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDExNDksImV4cCI6MjA3MTk3NzE0OX0.Sy0XzNOEdkGxdh8o_CmaVz2v6ul-EhHwKCbotDrtIIA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
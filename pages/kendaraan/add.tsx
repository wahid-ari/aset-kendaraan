import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { mutate } from 'swr';

import { useAuthorsData } from '@/libs/swr';
import useToast from '@/hooks/use-hot-toast';

import Layout from '@/components/layout/Layout';
import Button from '@/components/systems/Button';
import Label from '@/components/systems/Label';
import LabeledInput from '@/components/systems/LabeledInput';
import SearchBox from '@/components/systems/SearchBox';
import Shimmer from '@/components/systems/Shimmer';
import Text from '@/components/systems/Text';
import TextArea from '@/components/systems/TextArea';
import Title from '@/components/systems/Title';

// Kendaraan.auth = true;

export default function Kendaraan() {
  const router = useRouter();
  const { data: authors, error: errorAuthors } = useAuthorsData();
  const { updateToast, pushToast, dismissToast } = useToast();
  const [createItem, setCreateItem] = useState({
    author_id: null,
    nopol: '',
    nama: '',
    warna: '',
    id_tahun: '',
    id_instansi: '',
    id_jenis: '',
  });
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [queryAuthor, setQueryAuthor] = useState('');
  const filteredAuthor =
    queryAuthor === ''
      ? authors
      : authors.filter((item: any) =>
          item.name.toLowerCase().replace(/\s+/g, '').includes(queryAuthor.toLowerCase().replace(/\s+/g, '')),
        );

  // if user selecting author, set author id
  useEffect(() => {
    if (selectedAuthor) setCreateItem((createItem) => ({ ...createItem, author_id: selectedAuthor.id }));
  }, [selectedAuthor]);

  async function handleSave(e) {
    e.preventDefault();
    const toastId = pushToast({
      message: 'Menyimpan kendaraan',
      isLoading: true,
    });
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/kendaraan`, createItem);
      if (res.status == 200) {
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/kendaraan`);
        router.push('/kendaraan');
      }
    } catch (error) {
      console.error(error);
      if (Array.isArray(error?.response?.data?.message)) {
        const errors = [...error?.response?.data?.message].reverse();
        // show all error
        dismissToast();
        errors.forEach((item: any) => {
          pushToast({ message: item?.message, isError: true });
        });
        // only show one error
        // errors.map((item: any) => {
        //   updateToast({ toastId, message: item?.message, isError: true });
        // })
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  if (errorAuthors) {
    return (
      <Layout title='Tambah Kendaraan - BPKAD'>
        <div className='flex h-[36rem] items-center justify-center text-base'>Failed to load</div>
      </Layout>
    );
  }

  return (
    <Layout title='Tambah Kendaraan - BPKAD' description='Create New Kendaraan - BPKAD'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-y-3'>
        <Title>Tambah Kendaraan</Title>
      </div>

      <form onSubmit={handleSave} className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
        <div>
          <LabeledInput
            label='Nopol'
            type='text'
            name='nopol'
            value={createItem.nopol}
            onChange={(e) => setCreateItem({ ...createItem, nopol: e.target.value })}
            placeholder='Nopol Kendaraan'
          />

          <LabeledInput
            wrapperClassName='mt-0.5'
            label='Nama'
            type='text'
            name='nama'
            value={createItem.nama}
            onChange={(e) => setCreateItem({ ...createItem, nama: e.target.value })}
            placeholder='Nama Kendaraan'
          />

          <LabeledInput
            wrapperClassName='mt-0.5'
            label='Warna'
            type='text'
            name='warna'
            value={createItem.warna}
            onChange={(e) => setCreateItem({ ...createItem, warna: e.target.value })}
            placeholder='Warna Kendaraan'
          />
        </div>
        <div>
          {filteredAuthor ? (
            <SearchBox
              label='Author'
              value={selectedAuthor}
              placeholder='Search and Select Author'
              onChange={setSelectedAuthor}
              onChangeQuery={(e) => setQueryAuthor(e.target.value)}
              options={filteredAuthor}
              query={queryAuthor}
            />
          ) : (
            <>
              <Text>Author</Text>
              <Shimmer className='mb-4 mt-2 h-10' />
            </>
          )}

          <Button.success type='submit' className='mt-2 w-full py-2'>
            Save
          </Button.success>
        </div>
      </form>
    </Layout>
  );
}

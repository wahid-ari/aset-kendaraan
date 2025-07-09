import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { PlusIcon } from 'lucide-react';
import { mutate } from 'swr';
import { useDebounce } from 'use-debounce';

import { useKondisiData } from '@/libs/swr';
import useToast from '@/hooks/use-hot-toast';

import Layout from '@/components/layout/Layout';
import Button from '@/components/systems/Button';
import Dialog from '@/components/systems/Dialog';
import Input from '@/components/systems/Input';
import Label from '@/components/systems/Label';
import LabeledInput from '@/components/systems/LabeledInput';
import Shimmer from '@/components/systems/Shimmer';
import TableSimple from '@/components/systems/TableSimple';
import Title from '@/components/systems/Title';

// Kondisi.auth = true;
// This page secured through the middleware in root folder
export default function Kondisi() {
  const { data, error } = useKondisiData();
  const { updateToast, pushToast, dismissToast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [nama, setNama] = useState('');
  const [editItem, setEditItem] = useState({ id: null, nama: '' });
  const [deleteItem, setDeleteItem] = useState({ id: null, nama: '' });
  const [search, setSearch] = useState('');
  const [searchDebounce] = useDebounce(search, 300);

  const filteredData =
    searchDebounce === ''
      ? data
      : data.filter((item: any) =>
          item.nama.toLowerCase().replace(/\s+/g, '').includes(searchDebounce.toLowerCase().replace(/\s+/g, '')),
        );

  async function handleCreate() {
    const toastId = pushToast({
      message: `Menyimpan ${nama}`,
      isLoading: true,
    });
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis`, { nama: nama });
      if (res.status == 200) {
        setOpenCreateDialog(false);
        setNama('');
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis`);
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
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  async function handleEdit() {
    const toastId = pushToast({
      message: 'Memperbarui Kondisi',
      isLoading: true,
    });
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis`, editItem);
      if (res.status == 201) {
        setOpenEditDialog(false);
        setEditItem({ id: null, nama: '' });
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis`);
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
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  async function handleDelete() {
    const toastId = pushToast({
      message: `Menghapus ${deleteItem.nama}`,
      isLoading: true,
    });
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis?id=${deleteItem.id}`);
      if (res.status == 200) {
        setOpenDeleteDialog(false);
        setDeleteItem({ id: null, nama: '' });
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/jenis`);
      }
    } catch (error) {
      console.error(error);
      const { detail } = error?.response?.data;
      if (detail) {
        updateToast({ toastId, message: detail, isError: true });
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  function handleShowEditModal(id: any, nama: any) {
    setEditItem({ id: id, nama: nama });
    setOpenEditDialog(true);
  }

  function handleShowDeleteModal(id: any, nama: any) {
    setDeleteItem({ id: id, nama: nama });
    setOpenDeleteDialog(true);
  }

  if (error) {
    return (
      <Layout title='Kondisi - BPKAD'>
        <div className='flex h-[36rem] items-center justify-center text-base'>Failed to load</div>
      </Layout>
    );
  }

  return (
    <Layout title='Kondisi - BPKAD' prefetch={['/api/jenis']} description='View and Manage Kondisi - BPKAD'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-y-3'>
        <Title>Kondisi</Title>
        <Button.success onClick={() => setOpenCreateDialog(true)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Tambah Kondisi
        </Button.success>
      </div>

      <Label>Cari Kondisi</Label>
      <Input name='search' placeholder='Mobil' onChange={(e) => setSearch(e.target.value)} />

      <Dialog
        title='Tambah Kondisi'
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setNama('');
        }}
        onConfirm={handleCreate}
        confirmText='Simpan'
        cancelText='Batal'
      >
        <div className='mt-5'>
          <LabeledInput
            label='Kondisi'
            type='text'
            name='nama'
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder='Motor'
          />
        </div>
      </Dialog>

      <Dialog
        title='Edit Kondisi'
        open={openEditDialog}
        setOpen={setOpenEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onConfirm={handleEdit}
        confirmText='Simpan'
        cancelText='Batal'
        isEdit
      >
        <div className='mt-5'>
          <LabeledInput
            label='Kondisi'
            type='text'
            name='nama'
            value={editItem.nama}
            onChange={(e) => setEditItem({ ...editItem, nama: e.target.value })}
          />
        </div>
      </Dialog>

      <Dialog
        title='Hapus Kondisi'
        open={openDeleteDialog}
        isDanger
        setOpen={setOpenDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
      >
        <div className='mt-5 text-center sm:text-left'>
          Yakin ingin menghapus nama "<span className='font-semibold'>{deleteItem.nama}</span>" ?
        </div>
      </Dialog>

      {filteredData ? (
        <TableSimple
          head={
            <>
              <TableSimple.td shrink>No</TableSimple.td>
              <TableSimple.td>Kondisi</TableSimple.td>
              <TableSimple.td shrink>Aksi</TableSimple.td>
            </>
          }
        >
          {filteredData.map((item: any, index: number) => {
            return (
              <TableSimple.tr key={index}>
                <TableSimple.td shrink>{index + 1}</TableSimple.td>
                <TableSimple.td>
                  <Link
                    href={`jenis/detail/${item.id}`}
                    className='rounded text-sm font-medium transition-all duration-200 hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                  >
                    {item.nama}
                  </Link>
                </TableSimple.td>
                <TableSimple.td>
                  <Button className='mr-2 !px-[6px] !py-[2px]' onClick={() => handleShowEditModal(item.id, item.nama)}>
                    Edit
                  </Button>
                  <Button.danger
                    className='!px-[6px] !py-[2px]'
                    onClick={() => handleShowDeleteModal(item.id, item.nama)}
                  >
                    Hapus
                  </Button.danger>
                </TableSimple.td>
              </TableSimple.tr>
            );
          })}
        </TableSimple>
      ) : (
        <TableSimple
          head={
            <>
              <TableSimple.th shrink>No</TableSimple.th>
              <TableSimple.th className='text-left'>Kondisi</TableSimple.th>
              <TableSimple.th className='w-32'>Aksi</TableSimple.th>
            </>
          }
        >
          {[...Array(10).keys()].map((e, index) => (
            <TableSimple.tr key={index}>
              <TableSimple.td shrink>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td className='flex gap-2'>
                <Shimmer className='w-full p-3' />
                <Shimmer className='w-full p-3' />
              </TableSimple.td>
            </TableSimple.tr>
          ))}
        </TableSimple>
      )}
    </Layout>
  );
}

'use client'
import { useFormCreateProduct } from '@foundation/forms/src/createProduct'
import { Input } from '../atoms/input'
import { Textarea } from '../atoms/textArea'

import { ImagePreview } from '../molecules/ImagePreview'
import { Controller } from '@foundation/forms/src'

import { useImageUpload } from '@foundation/util/hooks'
import { revalidate } from '@foundation/network/src/actions/revalidate'
import {
  CreateProductDocument,
  namedOperations,
} from '@foundation/network/src/queries/generated'
import { useRouter } from 'next/navigation'
import { fetchGraphQLClient } from '@foundation/network/src/fetch/client'
import { Title } from '../atoms/typography'
import { Button } from '../atoms/button'

export const CreateProduct = ({
  manufacturerId,
}: {
  manufacturerId: string
}) => {
  const { register, handleSubmit, reset, resetField, control, watch } =
    useFormCreateProduct()

  const { image } = watch()

  const [, uploadImages] = useImageUpload()
  const router = useRouter()

  return (
    <div>
      <Title className="mb-2 text-lg font-semibold">Cadastrar Produto</Title>{' '}
      <form
        onSubmit={handleSubmit(async ({ name, description, image }) => {
          const images = await uploadImages(image)

          console.log('name, description, image', name, description, image)
          const { data, error } = await fetchGraphQLClient({
            document: CreateProductDocument,
            variables: {
              createProductInput: {
                image: images[0],
                name,
                description,
                manufacturerId,
              },
            },
          })
          if (data) {
            reset()
            revalidate(namedOperations.Query.myProducts)
            router.replace('/manufacturer/products')
          }
          if (error) {
            alert(error)
          }
        })}
        className="flex gap-2"
      >
        <div className="w-48 h-48">
          <ImagePreview src={image?.[0]} clearImage={() => resetField('image')}>
            <Controller
              control={control}
              name={`image`}
              render={({ field }) => (
                <Input
                  type="file"
                  accept="image/*"
                  multiple={false}
                  onChange={(e) => field.onChange(e?.target?.files)}
                />
              )}
            />
          </ImagePreview>
        </div>

        <div className="flex-grow space-y-2">
          <Input {...register('name')} placeholder="Nome do Produto" />
          <Textarea
            {...register('description')}
            placeholder="Descrição do produto"
          />
          <Button type="submit">Salvar produto</Button>
        </div>
      </form>
    </div>
  )
}
